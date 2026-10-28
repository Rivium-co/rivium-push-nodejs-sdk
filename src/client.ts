import { RiviumPushConfig } from './types';
import https from 'https';
import http from 'http';
import { SDK_NAME, SDK_VERSION } from './version';

const BASE_URL = 'https://push-api.rivium.co';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * The API base URL to use: the default when none is given, otherwise a valid
 * https URL (http only for localhost / 127.0.0.1), without a trailing slash.
 * Throws on anything else so a typo never sends the server secret elsewhere
 * in clear text.
 */
export function resolveBaseUrl(baseUrl?: string): string {
  if (baseUrl === undefined || baseUrl === null || baseUrl === '') return BASE_URL;
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error(`RiviumPush: baseUrl is not a valid URL: ${baseUrl}`);
  }
  const isLocal = LOCAL_HOSTS.has(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocal)) {
    throw new Error('RiviumPush: baseUrl must use https:// (http:// is allowed only for localhost and 127.0.0.1)');
  }
  if (parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error('RiviumPush: baseUrl must not contain credentials, a query string or a fragment');
  }
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

/** Sent on every request so the backend can attribute traffic to this SDK. */
export const SDK_HEADER_VALUE = `${SDK_NAME}/${SDK_VERSION}`;

export const DEFAULT_MAX_RATE_LIMIT_RETRIES = 2;
export const DEFAULT_MAX_RETRY_WAIT_MS = 60_000;
/** Upper bound for `maxRateLimitRetries`, whatever is configured. */
const RETRY_LIMIT = 10;

/**
 * The wait a `Retry-After` header asks for, in milliseconds: delay-seconds
 * or an HTTP date. Undefined when the header is missing or unreadable.
 */
export function parseRetryAfter(value: string | string[] | undefined, now: number = Date.now()): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw.trim() === '') return undefined;
  const text = raw.trim();
  if (/^\d+$/.test(text)) return Number(text) * 1000;
  const at = Date.parse(text);
  return Number.isNaN(at) ? undefined : Math.max(0, at - now);
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class HttpClient {
  private apiKey: string;
  private serverSecret: string;
  private baseUrl: string;
  private maxRateLimitRetries: number;
  private maxRetryWaitMs: number;

  constructor(config: RiviumPushConfig) {
    if (!config.apiKey) {
      throw new Error('RiviumPush: apiKey is required');
    }
    if (!config.serverSecret) {
      throw new Error('RiviumPush: serverSecret is required for server-side operations');
    }
    this.apiKey = config.apiKey;
    this.serverSecret = config.serverSecret;
    this.baseUrl = resolveBaseUrl(config.baseUrl);
    const retries = config.maxRateLimitRetries;
    this.maxRateLimitRetries =
      typeof retries === 'number' && Number.isInteger(retries) && retries >= 0
        ? Math.min(retries, RETRY_LIMIT)
        : DEFAULT_MAX_RATE_LIMIT_RETRIES;
    const wait = config.maxRetryWaitMs;
    this.maxRetryWaitMs = typeof wait === 'number' && Number.isFinite(wait) && wait >= 0 ? wait : DEFAULT_MAX_RETRY_WAIT_MS;
  }

  /**
   * One API call. A rate-limited answer (429) is retried after the wait the
   * API gives in `Retry-After` (or 1 s, 2 s, 4 s … without one), at most
   * `maxRateLimitRetries` times and never for a wait longer than
   * `maxRetryWaitMs`; then the 429 is thrown. Retrying is safe for every
   * method: a rate-limited request was refused before it did anything.
   */
  async request<T>(method: string, path: string, body?: any, query?: Record<string, any>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.requestOnce<T>(method, path, body, query);
      } catch (err) {
        if (!(err instanceof RiviumPushError) || err.statusCode !== 429 || attempt >= this.maxRateLimitRetries) throw err;
        const waitMs = err.retryAfter !== undefined ? err.retryAfter * 1000 : 1000 * 2 ** attempt;
        if (waitMs > this.maxRetryWaitMs) throw err;
        await sleep(waitMs);
      }
    }
  }

  private async requestOnce<T>(method: string, path: string, body?: any, query?: Record<string, any>): Promise<T> {
    // Appended rather than resolved, so a base URL with a path prefix keeps it.
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, v instanceof Date ? v.toISOString() : String(v));
        }
      }
    }

    const payload = body ? JSON.stringify(body) : undefined;
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    // Build headers
    const headers: Record<string, string | number> = {
      'x-api-key': this.apiKey,
      'x-server-secret': this.serverSecret,
      'Content-Type': 'application/json',
      'X-Rivium-SDK': SDK_HEADER_VALUE,
    };

    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    return new Promise<T>((resolve, reject) => {
      const req = lib.request(
        url,
        {
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            const statusCode = res.statusCode || 0;
            let parsed: any;
            try {
              parsed = data ? JSON.parse(data) : {};
            } catch {
              parsed = { message: data };
            }

            if (statusCode >= 200 && statusCode < 300) {
              resolve(parsed as T);
            } else {
              const waitMs = statusCode === 429 ? parseRetryAfter(res.headers['retry-after']) : undefined;
              const err = new RiviumPushError(
                parsed.message || `Request failed with status ${statusCode}`,
                statusCode,
                parsed,
                waitMs === undefined ? undefined : Math.ceil(waitMs / 1000),
              );
              reject(err);
            }
          });
        },
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  get<T>(path: string, query?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', path, undefined, query);
  }

  post<T>(path: string, body?: any, query?: Record<string, any>): Promise<T> {
    return this.request<T>('POST', path, body, query);
  }

  put<T>(path: string, body?: any, query?: Record<string, any>): Promise<T> {
    return this.request<T>('PUT', path, body, query);
  }

  patch<T>(path: string, body?: any): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string, body?: any, query?: Record<string, any>): Promise<T> {
    return this.request<T>('DELETE', path, body, query);
  }
}

export class RiviumPushError extends Error {
  statusCode: number;
  response: any;
  /** On a 429: seconds the API asked to wait before trying again (its `Retry-After`), when it gave one. */
  retryAfter?: number;

  constructor(message: string, statusCode: number, response: any, retryAfter?: number) {
    super(message);
    this.name = 'RiviumPushError';
    this.statusCode = statusCode;
    this.response = response;
    if (retryAfter !== undefined) this.retryAfter = retryAfter;
  }
}
