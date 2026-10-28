// Run with `npm test` (builds first). Uses only node:test, no dependencies.
const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { version } = require('../package.json');
const { SDK_NAME, SDK_VERSION } = require('../dist');
const { HttpClient, SDK_HEADER_VALUE } = require('../dist/client');

test('SDK_VERSION matches package.json', () => {
  assert.strictEqual(SDK_NAME, 'node');
  assert.strictEqual(SDK_VERSION, version);
  assert.strictEqual(SDK_HEADER_VALUE, `node/${version}`);
});

test('requests send X-Rivium-SDK and serialise Date query params', async () => {
  let seen;
  const server = http.createServer((req, res) => {
    seen = { header: req.headers['x-rivium-sdk'], url: req.url };
    res.setHeader('Content-Type', 'application/json');
    res.end('{"ok":true}');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const client = new HttpClient({ apiKey: 'k', serverSecret: 's' });
    // Test-only: point the private base URL at the local stub server.
    client.baseUrl = `http://127.0.0.1:${server.address().port}`;
    await client.get('/devices/a%2Fb/x', { since: new Date('2026-01-01T00:00:00Z'), skip: undefined });
    assert.strictEqual(seen.header, `node/${version}`);
    assert.strictEqual(seen.url, '/devices/a%2Fb/x?since=2026-01-01T00%3A00%3A00.000Z');
  } finally {
    server.close();
  }
});

test('baseUrl defaults to production and is validated', () => {
  const { resolveBaseUrl } = require('../dist/client');
  assert.strictEqual(resolveBaseUrl(undefined), 'https://push-api.rivium.co');
  assert.strictEqual(resolveBaseUrl(''), 'https://push-api.rivium.co');
  assert.strictEqual(resolveBaseUrl('https://push.example.com/'), 'https://push.example.com');
  assert.strictEqual(resolveBaseUrl('https://push.example.com/api/'), 'https://push.example.com/api');
  assert.strictEqual(resolveBaseUrl('http://localhost:3000'), 'http://localhost:3000');
  assert.strictEqual(resolveBaseUrl('http://127.0.0.1:3000'), 'http://127.0.0.1:3000');
  assert.throws(() => resolveBaseUrl('http://push.example.com'), /https/);
  assert.throws(() => resolveBaseUrl('ftp://push.example.com'), /https/);
  assert.throws(() => resolveBaseUrl('not a url'), /valid URL/);
  assert.throws(() => resolveBaseUrl('https://user:pw@push.example.com'), /credentials/);
  assert.throws(() => resolveBaseUrl('https://push.example.com?x=1'), /query/);

  const client = new HttpClient({ apiKey: 'k', serverSecret: 's' });
  assert.strictEqual(client.baseUrl, 'https://push-api.rivium.co');
});

test('requests go to the configured baseUrl, keeping its path prefix', async () => {
  let seenUrl;
  const server = http.createServer((req, res) => {
    seenUrl = req.url;
    res.setHeader('Content-Type', 'application/json');
    res.end('{"ok":true}');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const client = new HttpClient({
      apiKey: 'k',
      serverSecret: 's',
      baseUrl: `http://127.0.0.1:${server.address().port}/prefix/`,
    });
    await client.get('/devices/x', { page: 2 });
    assert.strictEqual(seenUrl, '/prefix/devices/x?page=2');
  } finally {
    server.close();
  }
});
