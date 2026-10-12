import test from 'node:test';
import assert from 'node:assert/strict';

test('server price catalog keeps the koi design and requested store prices', async () => {
  const { purchaseCatalog } = await import('../api/orders.js');
  assert.deepEqual(purchaseCatalog.kohaku, ['Кохаку · Волна', 1799]);
  assert.equal(purchaseCatalog['avatar-14'][1], 799);
  assert.equal(purchaseCatalog.coral[1], 399);
  assert.equal(purchaseCatalog.midnight[1], 249);
  assert.equal(Object.keys(purchaseCatalog).filter(key => key.startsWith('avatar-')).length, 14);
});

test('an order cannot be created before persistent storage is configured', async () => {
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_PRISMA_URL;
  const { default: handler } = await import('../api/orders.js');
  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
  await handler({ method: 'POST', headers: { host: 'kohaku-chess.vercel.app', origin: 'https://kohaku-chess.vercel.app' }, body: { itemId: 'kohaku', playerId: 'c622a770-cf99-4db7-b6e7-8402c7b5ac1a', playerName: 'Игрок' } }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, 'PAYMENTS_NOT_CONFIGURED');
  assert.match(response.body.error, /перевод пока не отправляйте/i);
});

test('preview is available only for cosmetics already in the collection', async () => {
  const { canPreviewCosmetic } = await import('../dist/shop-state.js');
  assert.equal(canPreviewCosmetic('design', false), false);
  assert.equal(canPreviewCosmetic('palette', false), false);
  assert.equal(canPreviewCosmetic('board', true), true);
  assert.equal(canPreviewCosmetic('avatar', true), false);
});

test('host session requires the configured password and signs its cookie', async () => {
  process.env.ADMIN_PASSWORD = 'unit-test-only-password';
  process.env.ADMIN_SESSION_SECRET = 'unit-test-only-secret-with-at-least-32-bytes';
  const auth = await import('../api/_admin-auth.js');
  assert.equal(auth.readyForAdmin(), true);
  assert.equal(auth.verifyPassword('unit-test-only-password'), true);
  assert.equal(auth.verifyPassword('incorrect'), false);
  const token = auth.createSession();
  assert.equal(auth.isAdmin({ headers: { cookie: `kohaku_host_session=${token}` } }), true);
  assert.equal(auth.isAdmin({ headers: {} }), false);
  assert.match(auth.cookieHeader(token), /HttpOnly; Secure; SameSite=Strict/);
});

const responseRecorder = () => ({
  headers: {},
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  json(value) { this.body = value; return this; }
});
const apiHeaders = { host: 'kohaku-chess.vercel.app', origin: 'https://kohaku-chess.vercel.app' };

test('reports require a matching sender and reject malformed or impossible transfer details', async () => {
  const { validatePaymentReport } = await import('../api/orders.js');
  const now = Date.parse('2026-10-12T12:00:00Z');
  assert.ok(validatePaymentReport({ payerName: '' }, now).error);
  assert.ok(validatePaymentReport({ payerName: {} }, now).error);
  assert.ok(validatePaymentReport({ payerName: 'Тест', bankReference: 'x'.repeat(101) }, now).error);
  assert.ok(validatePaymentReport({ payerName: 'Тест', paidAt: 'not-a-date' }, now).error);
  assert.ok(validatePaymentReport({ payerName: 'Тест', paidAt: '2027-10-12T12:00:00Z' }, now).error);
  assert.ok(validatePaymentReport({ payerName: 'Тест', paidAt: '2025-10-12T12:00:00Z' }, now).error);
  assert.deepEqual(validatePaymentReport({ payerName: ' Амина М. ', bankReference: ' TX-123 ', paidAt: '2026-10-12T16:50:00+05:00' }, now), { payerName: 'Амина М.', bankReference: 'TX-123', paidAt: '2026-10-12T11:50:00.000Z' });
});

test('malformed JSON returns a structured client error for both payment endpoints', async () => {
  const { default: orders } = await import('../api/orders.js');
  const { default: admin } = await import('../api/admin.js');
  process.env.ADMIN_PASSWORD = 'unit-test-only-password';
  process.env.ADMIN_SESSION_SECRET = 'unit-test-only-secret-with-at-least-32-bytes';
  for (const handler of [orders, admin]) {
    const response = responseRecorder();
    await handler({ method: 'POST', headers: apiHeaders, body: '{broken' }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, 'Некорректный запрос.');
  }
});

test('malformed, tampered and extra-component admin cookies do not grant access', async () => {
  const auth = await import('../api/_admin-auth.js');
  process.env.ADMIN_PASSWORD = 'unit-test-only-password';
  process.env.ADMIN_SESSION_SECRET = 'unit-test-only-secret-with-at-least-32-bytes';
  for (const token of ['%E0%A4%A', '9999999999.invalid', `${auth.createSession()}.extra`]) {
    assert.equal(auth.isAdmin({ headers: { cookie: `kohaku_host_session=${token}` } }), false);
  }
  const { default: admin } = await import('../api/admin.js');
  const response = responseRecorder();
  await admin({ method: 'GET', headers: { ...apiHeaders, cookie: 'kohaku_host_session=%E0%A4%A' } }, response);
  assert.equal(response.statusCode, 401);
});

test('cross-origin callers cannot create, report or review payments', async () => {
  const { default: orders } = await import('../api/orders.js');
  const { default: admin } = await import('../api/admin.js');
  for (const handler of [orders, admin]) {
    const response = responseRecorder();
    await handler({ method: 'POST', headers: { ...apiHeaders, origin: 'https://unrelated.example' }, body: {} }, response);
    assert.equal(response.statusCode, 403);
  }
});

test('opening payment is blocked when owner access or transfer destination is unavailable', async () => {
  const { default: handler } = await import('../api/orders.js');
  delete process.env.TRANSFER_PHONE;
  delete process.env.TRANSFER_RECIPIENT;
  const response = responseRecorder();
  await handler({ method: 'POST', headers: apiHeaders, body: { itemId: 'kohaku', playerId: 'c622a770-cf99-4db7-b6e7-8402c7b5ac1a' } }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, 'PAYMENTS_NOT_CONFIGURED');
});