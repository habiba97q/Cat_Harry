const test = require('node:test');
const assert = require('node:assert/strict');

process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/studiospace-test';
process.env.JWT_SECRET = 'test-secret-for-server-smoke-test';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

const app = require('../src/index');

test('serves health and configured CORS without connecting to MongoDB', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${origin}/api/health`, {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.deepEqual(await health.json(), { success: true, status: 'ok' });

  const google = await fetch(`${origin}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'not-used-without-oauth-config' }),
  });
  assert.equal(google.status, 501);
  assert.equal((await google.json()).success, false);

  const notFound = await fetch(`${origin}/missing`);
  assert.equal(notFound.status, 404);
});
