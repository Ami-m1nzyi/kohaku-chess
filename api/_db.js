import { neon } from '@neondatabase/serverless';

let query;
let ready;

export function database() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) throw new Error('DATABASE_NOT_CONFIGURED');
  query ||= neon(connectionString);
  ready ||= (async () => {
    await query`
    CREATE TABLE IF NOT EXISTS kohaku_purchase_orders (
      id text PRIMARY KEY,
      player_id text NOT NULL,
      player_name text NOT NULL,
      item_id text NOT NULL,
      item_title text NOT NULL,
      amount integer NOT NULL CHECK (amount > 0),
      status text NOT NULL CHECK (status IN ('awaiting_payment', 'pending_review', 'approved', 'rejected')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz,
      rejection_reason text,
      payer_name text,
      bank_reference text,
      paid_at timestamptz
    )
    `;
    await query`ALTER TABLE kohaku_purchase_orders ADD COLUMN IF NOT EXISTS payer_name text, ADD COLUMN IF NOT EXISTS bank_reference text, ADD COLUMN IF NOT EXISTS paid_at timestamptz`;
    await query`CREATE UNIQUE INDEX IF NOT EXISTS kohaku_purchase_active_item ON kohaku_purchase_orders (player_id, item_id) WHERE status IN ('awaiting_payment', 'pending_review', 'approved')`;
    await query`CREATE INDEX IF NOT EXISTS kohaku_purchase_player_created ON kohaku_purchase_orders (player_id, created_at DESC)`;
    return true;
  })().catch(error => { ready = undefined; throw error; });
  return ready.then(() => query);
}

export function json(res, status, value) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(value);
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

export function readBody(req) {
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}; }
  catch { throw new Error('INVALID_JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_JSON');
  return body;
}
