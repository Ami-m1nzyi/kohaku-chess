import { database, json, readBody, sameOrigin } from './_db.js';
import { cookieHeader, createSession, isAdmin, readyForAdmin, verifyPassword } from './_admin-auth.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return json(res, 405, { error: 'Метод не поддерживается.' });
    if (!sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });
    if (!readyForAdmin()) return json(res, 503, { code: 'ADMIN_NOT_CONFIGURED', error: 'Панель владельца ещё не настроена.' });
    if (req.method === 'POST') {
      const body = readBody(req);
      if (!verifyPassword(body.password)) return json(res, 401, { error: 'Неверный пароль.' });
      res.setHeader('Set-Cookie', cookieHeader(createSession()));
      return json(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', cookieHeader('', 0));
      return json(res, 200, { ok: true });
    }
    if (!isAdmin(req)) return json(res, 401, { error: 'Войдите в панель владельца.' });
    const sql = await database();
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, player_name AS "playerName", item_id AS "itemId", item_title AS "itemTitle", amount, status, created_at AS "createdAt", updated_at AS "updatedAt", reviewed_at AS "reviewedAt", payer_name AS "payerName", bank_reference AS "bankReference", paid_at AS "paidAt", rejection_reason AS "rejectionReason" FROM kohaku_purchase_orders ORDER BY CASE status WHEN 'pending_review' THEN 0 WHEN 'awaiting_payment' THEN 1 ELSE 2 END, created_at DESC LIMIT 250`;
      return json(res, 200, { orders: rows });
    }
    const body = readBody(req);
    const orderId = String(body.orderId || '');
    if (!/^KH-[A-Z0-9-]{8,40}$/.test(orderId) || !['approved', 'rejected'].includes(body.status)) return json(res, 400, { error: 'Некорректное решение по заявке.' });
    const reason = String(body.reason || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 240);
    const rows = await sql`UPDATE kohaku_purchase_orders SET status = ${body.status}, rejection_reason = ${body.status === 'rejected' ? (reason || 'Перевод не найден') : null}, reviewed_at = now(), updated_at = now() WHERE id = ${orderId} AND status = 'pending_review' RETURNING id`;
    if (!rows.length) return json(res, 409, { error: 'Решение уже принято или покупатель ещё не сообщил о переводе.' });
    return json(res, 200, { ok: true });
  } catch (error) {
    if (error.message === 'INVALID_JSON') return json(res, 400, { error: 'Некорректный запрос.' });
    if (error.message === 'DATABASE_NOT_CONFIGURED') return json(res, 503, { code: 'PAYMENTS_NOT_CONFIGURED', error: 'База заявок ещё не подключена.' });
    console.error('Kohaku admin API failed:', error.code || error.name);
    return json(res, 503, { error: 'Не удалось загрузить заявки. Попробуйте ещё раз.' });
  }
}