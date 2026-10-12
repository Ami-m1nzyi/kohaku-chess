import { randomBytes } from 'node:crypto';
import { database, json, readBody, sameOrigin } from './_db.js';
import { readyForAdmin } from './_admin-auth.js';
export const purchaseCatalog = {
  classic: ['Тихая классика', 399], poster: ['Эмбер × Фрост', 399], origami: ['Киригами', 399],
  kohaku: ['Кохаку · Волна', 1799], wave: ['Морская гравюра', 399], lantern: ['Бумажные фонари', 399], moon: ['Лунный сад', 399],
  ember: ['Эмбер', 399], frost: ['Фрост', 399], koi: ['Сакура', 399], jade: ['Карпы кои', 399], amethyst: ['Аметист', 399], coral: ['Коралловый сад', 399], gold: ['Золотой закат', 399], glacier: ['Ледник', 399], plum: ['Сливовый чай', 399],
  sakura: ['Сакура', 249], neon: ['Неоновые сумерки', 249], moss: ['Моховый сад', 249], desert: ['Песчаный берег', 249], ice: ['Зимний пруд', 249], lavender: ['Лавандовые сумерки', 249], autumn: ['Осенний клён', 249], midnight: ['Полночь', 249],
  ...Object.fromEntries(Array.from({ length: 14 }, (_, index) => [`avatar-${index + 1}`, [['Киллуа','Гон','Курапика','Хисока','Леорио','Накрот','Киллуа · портрет','Охотник','Курапика · янтарь','Киллуа · пиксель','Хисока · холод','Курапика · алый','Годжо','Гон · розовый'][index], 799]]))
};
const playerIdPattern = /^[a-f\d]{8}-[a-f\d]{4}-[1-8a-f][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const safeText = value => String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim();
const safePlayerName = value => safeText(value).slice(0, 24) || 'Игрок';
const paymentDetails = () => ({ phone: String(process.env.TRANSFER_PHONE || '').trim(), recipient: String(process.env.TRANSFER_RECIPIENT || '').trim() });

export function validatePaymentReport(body, now = Date.now()) {
  if (typeof body.payerName !== 'string' || (body.bankReference != null && typeof body.bankReference !== 'string')) return { error: 'Укажите имя отправителя и номер операции текстом.' };
  const payerName = safeText(body.payerName);
  const bankReference = safeText(body.bankReference);
  if (payerName.length < 2 || payerName.length > 80) return { error: 'Укажите имя отправителя из банковского приложения (от 2 до 80 символов).' };
  if (bankReference.length > 100) return { error: 'Номер операции должен быть не длиннее 100 символов.' };
  let paidAt = null;
  if (body.paidAt) {
    if (typeof body.paidAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(body.paidAt)) return { error: 'Проверьте дату и время перевода.' };
    const timestamp = Date.parse(String(body.paidAt));
    if (!Number.isFinite(timestamp) || timestamp > now + 5 * 60 * 1000 || timestamp < now - 30 * 24 * 60 * 60 * 1000) return { error: 'Проверьте дату и время перевода: укажите время за последние 30 дней.' };
    paidAt = new Date(timestamp).toISOString();
  }
  return { payerName, bankReference: bankReference || null, paidAt };
}

export default async function handler(req, res) {
  try {
    if (!['GET', 'POST', 'PATCH'].includes(req.method)) return json(res, 405, { error: 'Метод не поддерживается.' });
    if (req.method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Запрос отклонён.' });
    const body = req.method === 'GET' ? null : readBody(req);
    const playerId = String(req.method === 'GET' ? req.query?.playerId || '' : body.playerId || '');
    if (!playerIdPattern.test(playerId)) return json(res, 400, { error: 'Некорректный профиль.' });
    const details = paymentDetails();
    if (req.method === 'POST' && (!details.phone || !details.recipient || !readyForAdmin())) return json(res, 503, { code: 'PAYMENTS_NOT_CONFIGURED', error: 'Приём заявок ещё не настроен. Перевод пока не отправляйте.' });
    const sql = await database();
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, item_id AS "itemId", item_title AS "itemTitle", amount, status, created_at AS "createdAt", updated_at AS "updatedAt", payer_name AS "payerName", bank_reference AS "bankReference", paid_at AS "paidAt", rejection_reason AS "rejectionReason" FROM kohaku_purchase_orders WHERE player_id = ${playerId} ORDER BY created_at DESC LIMIT 50`;
      const owned = await sql`SELECT DISTINCT item_id AS "itemId" FROM kohaku_purchase_orders WHERE player_id = ${playerId} AND status = 'approved'`;
      return json(res, 200, { orders: rows, ownedItemIds: owned.map(row => row.itemId), paymentDetails: details });
    }
    if (req.method === 'POST') {
      const itemId = String(body.itemId || '');
      if (!Object.hasOwn(purchaseCatalog, itemId)) return json(res, 400, { error: 'Не удалось создать заявку: предмет не найден.' });
      const item = purchaseCatalog[itemId];
      const id = `KH-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
      const rows = await sql`INSERT INTO kohaku_purchase_orders (id, player_id, player_name, item_id, item_title, amount, status) VALUES (${id}, ${playerId}, ${safePlayerName(body.playerName)}, ${itemId}, ${item[0]}, ${item[1]}, 'awaiting_payment') ON CONFLICT (player_id, item_id) WHERE status IN ('awaiting_payment', 'pending_review', 'approved') DO UPDATE SET player_name = kohaku_purchase_orders.player_name RETURNING id, item_id AS "itemId", item_title AS "itemTitle", amount, status, created_at AS "createdAt", updated_at AS "updatedAt", payer_name AS "payerName", bank_reference AS "bankReference", paid_at AS "paidAt", rejection_reason AS "rejectionReason"`;
      return json(res, rows[0].id === id ? 201 : 200, { order: rows[0], paymentDetails: details });
    }
    if (body.action !== 'report' || !/^KH-[A-Z0-9-]{8,40}$/.test(String(body.orderId || ''))) return json(res, 400, { error: 'Не удалось отправить заявку на проверку.' });
    const report = validatePaymentReport(body);
    if (report.error) return json(res, 400, { error: report.error });
    const rows = await sql`UPDATE kohaku_purchase_orders SET status = 'pending_review', payer_name = ${report.payerName}, bank_reference = ${report.bankReference}, paid_at = ${report.paidAt}, updated_at = now() WHERE id = ${body.orderId} AND player_id = ${playerId} AND status = 'awaiting_payment' RETURNING id`;
    if (!rows.length) {
      const existing = await sql`SELECT status FROM kohaku_purchase_orders WHERE id = ${body.orderId} AND player_id = ${playerId}`;
      if (existing[0]?.status !== 'pending_review') return json(res, 409, { error: 'По заявке уже принято решение или она не найдена. Обновите список заказов.' });
    }
    return json(res, 200, { ok: true, status: 'pending_review' });
  } catch (error) {
    if (error.message === 'INVALID_JSON') return json(res, 400, { error: 'Некорректный запрос.' });
    if (error.message === 'DATABASE_NOT_CONFIGURED') return json(res, 503, { code: 'PAYMENTS_NOT_CONFIGURED', error: 'Приём заявок ещё не настроен. Перевод пока не отправляйте.' });
    console.error('Kohaku order API failed:', error.code || error.name);
    return json(res, 503, { code: 'ORDER_SERVICE_UNAVAILABLE', error: 'Сервис заявок временно недоступен. Перевод пока не отправляйте.' });
  }
}
