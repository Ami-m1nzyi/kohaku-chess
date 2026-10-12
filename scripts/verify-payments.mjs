import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { database } from '../api/_db.js';

// Run: node --env-file=.env.production.local scripts/verify-payments.mjs
// Deployed target: append --base-url https://your-project.vercel.app
// Uses only a fresh TEST profile; deletes that profile's rows in finally.
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--base-url')) throw new Error('Usage: verify-payments.mjs [--base-url URL]');
const base = new URL(args[1] || 'http://127.0.0.1:4174');
assert(!base.username && !base.password && !base.search && !base.hash && base.pathname === '/', 'Use a base URL without credentials, query or path.');
assert(base.protocol === 'https:' || (base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname)), 'Use HTTPS or a local test server.');
assert(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET, 'Load the owner environment before running this check.');
assert(process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL, 'Load the matching database environment before running this check.');
const playerId = randomUUID();
const otherPlayerId = randomUUID();
const playerName = `TEST ${playerId.slice(0, 8)}`;
let server;
let sql;
let cookie = '';
let checks = 0;
const passed = label => { checks++; console.log(`PASS ${label}`); };

async function request(path, method = 'GET', body, asAdmin = false) {
  const headers = { Origin: base.origin };
  if (body) headers['Content-Type'] = 'application/json';
  if (asAdmin && cookie) headers.Cookie = cookie;
  const response = await fetch(new URL(path, base), { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) });
  let data;
  try { data = await response.json(); } catch { throw new Error(`${method} ${path.split('?')[0]} did not return JSON (${response.status}).`); }
  return { status: response.status, data, headers: response.headers };
}

async function startServer() {
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, PORT: '4174' },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  // Do not print server output because this process inherits private environment values.
  server.stderr.resume();
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Temporary payment server did not start.')), 10000);
    server.once('error', () => { clearTimeout(timeout); reject(new Error('Could not start the temporary payment server.')); });
    server.once('exit', () => { clearTimeout(timeout); reject(new Error('Temporary payment server exited before startup; port 4174 may be busy.')); });
    server.stdout.on('data', chunk => { if (chunk.toString().includes('Local:')) { clearTimeout(timeout); resolve(); } });
  });
}

try {
  sql = await database();
  if (!args.length) await startServer();

  assert.equal((await request('/api/admin')).status, 401, 'Admin listing must require a session.');
  assert.equal((await request('/api/admin', 'PATCH', { orderId: 'KH-TEST-000000', status: 'approved' })).status, 401, 'Admin approval must require a session.');
  passed('owner access is denied without login');

  const creates = await Promise.all(Array.from({ length: 4 }, () => request('/api/orders', 'POST', { playerId, playerName, itemId: 'kohaku', amount: 1 })));
  assert(creates.every(result => [200, 201].includes(result.status)), 'Concurrent order requests must succeed.');
  const order = creates[0].data.order;
  assert(creates.every(result => result.data.order?.id === order.id), 'Concurrent requests must reuse a single order.');
  assert(creates.every(result => result.data.order?.amount === 1799), 'Price must come from the server catalog.');
  assert(creates.every(result => result.data.paymentDetails?.phone === process.env.TRANSFER_PHONE && result.data.paymentDetails?.recipient === process.env.TRANSFER_RECIPIENT), 'Payment destination must come from server configuration.');
  const stored = await sql`SELECT id FROM kohaku_purchase_orders WHERE player_id = ${playerId} AND item_id = 'kohaku'`;
  assert.equal(stored.length, 1, 'Exactly one order must be stored for concurrent creation.');
  passed('concurrent creation is idempotent and uses the 1799 KZT server price');

  const missing = await request('/api/orders', 'PATCH', { action: 'report', playerId, orderId: order.id });
  assert.equal(missing.status, 400, 'Reporting must require the bank sender name.');
  const report = { action: 'report', playerId, orderId: order.id, payerName: 'TEST payer', bankReference: `TEST-${playerId.slice(0, 8)}`, paidAt: new Date().toISOString() };
  assert.equal((await request('/api/orders', 'PATCH', { ...report, playerId: otherPlayerId })).status, 409, 'A different profile must not report another profile order.');
  assert.equal((await request('/api/orders', 'PATCH', report)).status, 200, 'The transfer report must succeed.');
  assert.equal((await request('/api/orders', 'PATCH', report)).status, 200, 'Retrying the same report must be safe.');
  passed('sender validation, profile isolation and report retries');

  const login = await request('/api/admin', 'POST', { password: process.env.ADMIN_PASSWORD });
  assert.equal(login.status, 200, 'Owner login must succeed.');
  const setCookie = login.headers.get('set-cookie') || '';
  assert(setCookie.includes('HttpOnly') && setCookie.includes('Secure') && setCookie.includes('SameSite=Strict'), 'Owner session cookie must be protected.');
  cookie = setCookie.split(';')[0];
  const adminList = await request('/api/admin', 'GET', undefined, true);
  assert.equal(adminList.status, 200, 'Authenticated owner must load the order list.');
  const own = adminList.data.orders.find(row => row.id === order.id);
  assert(own?.payerName === report.payerName && own?.bankReference === report.bankReference && Date.parse(own?.paidAt) === Date.parse(report.paidAt), 'The owner must receive matching sender, operation and transfer time.');
  passed('owner login and transfer details are available in the protected queue');

  assert.equal((await request('/api/admin', 'PATCH', { orderId: order.id, status: 'approved' }, true)).status, 200, 'Only this TEST order must be approved.');
  const approvedList = await request(`/api/orders?playerId=${playerId}`);
  assert.equal(approvedList.status, 200);
  assert(approvedList.data.ownedItemIds.includes('kohaku'), 'Approval must grant the purchased item.');
  assert.equal(approvedList.data.orders.find(row => row.id === order.id)?.status, 'approved');
  const again = await request('/api/orders', 'POST', { playerId, playerName, itemId: 'kohaku' });
  assert.equal(again.status, 200);
  assert(again.data.order?.id === order.id && again.data.order?.status === 'approved', 'An approved purchase must be reused without another transfer.');
  passed('approval grants ownership and prevents duplicate payment');

  const second = await request('/api/orders', 'POST', { playerId, playerName, itemId: 'coral' });
  assert.equal(second.status, 201);
  assert.equal(second.data.order?.amount, 399);
  const rejectedId = second.data.order.id;
  assert.equal((await request('/api/orders', 'PATCH', { ...report, orderId: rejectedId })).status, 200);
  assert.equal((await request('/api/admin', 'PATCH', { orderId: rejectedId, status: 'rejected', reason: 'TEST transfer not found' }, true)).status, 200);
  const rejectedList = await request(`/api/orders?playerId=${playerId}`);
  assert(!rejectedList.data.ownedItemIds.includes('coral'), 'Rejection must not grant the item.');
  const rejected = rejectedList.data.orders.find(row => row.id === rejectedId);
  assert(rejected?.status === 'rejected' && rejected?.rejectionReason === 'TEST transfer not found', 'The buyer must receive the rejection reason.');
  passed('rejection preserves its reason and does not unlock the item');

  // Create history only for this disposable TEST profile, to test the 50-order boundary.
  await sql`INSERT INTO kohaku_purchase_orders (id, player_id, player_name, item_id, item_title, amount, status, created_at) SELECT ${`KH-TEST-${playerId}-`} || n, ${playerId}, ${playerName}, 'classic', 'TEST pagination row', 399, 'rejected', now() + interval '1 second' FROM generate_series(1, 51) AS n`;
  const paginated = await request(`/api/orders?playerId=${playerId}`);
  assert.equal(paginated.data.orders.length, 50);
  assert(!paginated.data.orders.some(row => row.id === order.id), 'The approved order should be outside the recent-history page in this test.');
  assert(paginated.data.ownedItemIds.includes('kohaku'), 'Ownership must include approved orders outside the 50-row history page.');
  passed('older approved purchases remain owned beyond the history limit');

  const logout = await request('/api/admin', 'DELETE', undefined, true);
  assert.equal(logout.status, 200);
  assert((logout.headers.get('set-cookie') || '').includes('Max-Age=0'), 'Logout must expire the owner cookie.');
  cookie = '';
  assert.equal((await request('/api/admin', 'GET', undefined, true)).status, 401);
  passed('logout expires the cookie and removes access');
  console.log(`Payment integration smoke: ${checks}/${checks} checks passed.`);
} catch (error) {
  console.error(`Payment integration smoke failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (sql) {
    try {
      await sql`DELETE FROM kohaku_purchase_orders WHERE player_id = ${playerId}`;
      const remaining = await sql`SELECT count(*)::int AS count FROM kohaku_purchase_orders WHERE player_id = ${playerId}`;
      assert.equal(remaining[0]?.count, 0);
      console.log('Cleanup verified: only this run\'s TEST profile rows were removed.');
    } catch {
      console.error(`TEST cleanup failed; inspect only player_id ${playerId}.`);
      process.exitCode = 1;
    }
  }
  if (server && server.exitCode === null) {
    server.kill();
    await Promise.race([once(server, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))]);
  }
}
