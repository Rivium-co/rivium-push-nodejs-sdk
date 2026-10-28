// Run with `npm test` (builds first). Uses only node:test, no dependencies.
const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { RiviumPushError } = require('../dist');
const { HttpClient, parseRetryAfter } = require('../dist/client');

/** A local API stub answering from a list of { status, headers, body }; the last answer repeats. */
async function stub(answers) {
  const seen = [];
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      seen.push({ at: Date.now(), method: req.method, url: req.url, body: raw });
      const a = answers[Math.min(seen.length - 1, answers.length - 1)];
      res.writeHead(a.status, { 'Content-Type': 'application/json', ...(a.headers || {}) });
      res.end(JSON.stringify(a.body || {}));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { seen, server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

const limited = (retryAfter) => ({
  status: 429,
  headers: retryAfter === undefined ? {} : { 'Retry-After': String(retryAfter) },
  body: { statusCode: 429, code: 'rate_limit_exceeded', error: 'Too Many Requests', message: 'Rate limit exceeded. Retry after 1 second.' },
});

test('a 429 is retried after Retry-After, then the call succeeds', async () => {
  const s = await stub([limited(1), { status: 200, body: { success: 1 } }]);
  try {
    const client = new HttpClient({ apiKey: 'k', serverSecret: 's', baseUrl: s.baseUrl });
    const result = await client.post('/push/send', { deviceId: 'd1', title: 't', body: 'b' });
    assert.deepStrictEqual(result, { success: 1 });
    assert.strictEqual(s.seen.length, 2);
    assert.ok(s.seen[1].at - s.seen[0].at >= 950, 'waited about the Retry-After');
    assert.strictEqual(s.seen[1].body, s.seen[0].body, 'same request sent again');
  } finally {
    s.server.close();
  }
});

test('retries are bounded: after maxRateLimitRetries the 429 is thrown with retryAfter', async () => {
  const s = await stub([limited(0)]);
  try {
    const client = new HttpClient({ apiKey: 'k', serverSecret: 's', baseUrl: s.baseUrl, maxRateLimitRetries: 2 });
    await assert.rejects(client.get('/devices'), (err) => {
      assert.ok(err instanceof RiviumPushError);
      assert.strictEqual(err.statusCode, 429);
      assert.strictEqual(err.retryAfter, 0);
      assert.strictEqual(err.response.code, 'rate_limit_exceeded');
      return true;
    });
    assert.strictEqual(s.seen.length, 3, 'first try + 2 retries');
  } finally {
    s.server.close();
  }
});

test('a wait longer than maxRetryWaitMs is not waited for', async () => {
  const s = await stub([limited(3600)]);
  try {
    const client = new HttpClient({ apiKey: 'k', serverSecret: 's', baseUrl: s.baseUrl, maxRetryWaitMs: 5000 });
    const started = Date.now();
    await assert.rejects(client.get('/devices'), (err) => err instanceof RiviumPushError && err.retryAfter === 3600);
    assert.strictEqual(s.seen.length, 1);
    assert.ok(Date.now() - started < 1000);
  } finally {
    s.server.close();
  }
});

test('maxRateLimitRetries: 0 turns retrying off; other errors are never retried', async () => {
  const s = await stub([limited(0)]);
  const e = await stub([{ status: 500, body: { message: 'boom' } }]);
  try {
    const off = new HttpClient({ apiKey: 'k', serverSecret: 's', baseUrl: s.baseUrl, maxRateLimitRetries: 0 });
    await assert.rejects(off.get('/devices'), (err) => err.statusCode === 429);
    assert.strictEqual(s.seen.length, 1);

    const client = new HttpClient({ apiKey: 'k', serverSecret: 's', baseUrl: e.baseUrl });
    await assert.rejects(client.get('/devices'), (err) => err.statusCode === 500 && err.retryAfter === undefined);
    assert.strictEqual(e.seen.length, 1);
  } finally {
    s.server.close();
    e.server.close();
  }
});

test('parseRetryAfter reads seconds and HTTP dates', () => {
  const now = Date.parse('2026-01-01T00:00:00Z');
  assert.strictEqual(parseRetryAfter('30', now), 30000);
  assert.strictEqual(parseRetryAfter(['5'], now), 5000);
  assert.strictEqual(parseRetryAfter('Thu, 01 Jan 2026 00:00:10 GMT', now), 10000);
  assert.strictEqual(parseRetryAfter('Wed, 31 Dec 2025 23:59:00 GMT', now), 0);
  assert.strictEqual(parseRetryAfter(undefined, now), undefined);
  assert.strictEqual(parseRetryAfter('soon', now), undefined);
});
