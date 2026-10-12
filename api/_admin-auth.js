import { createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = 'kohaku_host_session';
const maxAge = 60 * 60 * 24 * 7;
const signature = value => createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(value).digest('base64url');

export function readyForAdmin() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

export function cookieHeader(value, maxAgeSeconds = maxAge) {
  return `${cookieName}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

export function verifyPassword(input) {
  if (!readyForAdmin()) return false;
  const expected = Buffer.from(signature(`password:${process.env.ADMIN_PASSWORD}`));
  const actual = Buffer.from(signature(`password:${String(input || '')}`));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSession() {
  const expiry = String(Math.floor(Date.now() / 1000) + maxAge);
  return `${expiry}.${signature(`session:${expiry}`)}`;
}

export function isAdmin(req) {
  if (!readyForAdmin()) return false;
  const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`));
  if (!cookie) return false;
  let value;
  try { value = decodeURIComponent(cookie.slice(cookieName.length + 1)); } catch { return false; }
  const [expiry, supplied, extra] = value.split('.');
  if (extra !== undefined) return false;
  if (!/^\d+$/.test(expiry || '') || Number(expiry) <= Date.now() / 1000 || !supplied) return false;
  const expected = Buffer.from(signature(`session:${expiry}`));
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
