import { RiviumPushConfig } from './types';
import https from 'https';
import http from 'http';

const BASE_URL = 'https://push-api.rivium.co';

export class HttpClient {
  private apiKey: string;
  private serverSecret: string;
  private baseUrl: string;

  constructor(config: RiviumPushConfig) {
    if (!config.apiKey) {
      throw new Error('RiviumPush: apiKey is required');
    }
    if (!config.serverSecret) {
      throw new Error('RiviumPush: serverSecret is required for server-side operations');
    }
    this.apiKey = config.apiKey;
    this.serverSecret = config.serverSecret;
    this.baseUrl = BASE_URL;
  }

  async request<T>(method: string, path: string, body?: any, query?: Record<string, any>): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, String(v));
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
              const err = new RiviumPushError(
                parsed.message || `Request failed with status ${statusCode}`,
                statusCode,
                parsed,
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

  constructor(message: string, statusCode: number, response: any) {
    super(message);
    this.name = 'RiviumPushError';
    this.statusCode = statusCode;
    this.response = response;
  }
}
