/**
 * New-order email to the shop (Resend).
 *
 * Deploy: `supabase functions deploy notify-new-order --no-verify-jwt`
 * Secrets: `supabase secrets set RESEND_API_KEY=re_xxx ORDER_NOTIFY_SECRET=long-random-string`
 * Optional: `SHOP_NOTIFY_EMAIL` (default info.aromatales@gmail.com), `RESEND_FROM`
 *
 * Hook: Dashboard → Integrations → Database Webhooks → INSERT on `orders`
 * URL: https://<PROJECT_REF>.supabase.co/functions/v1/notify-new-order
 * HTTP Headers: Authorization = Bearer <ORDER_NOTIFY_SECRET>
 * (Or create the webhook via SQL with the same URL + header.)
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
const NOTIFY_SECRET = Deno.env.get('ORDER_NOTIFY_SECRET');
const TO = Deno.env.get('SHOP_NOTIFY_EMAIL') ?? 'info.aromatales@gmail.com';
const FROM =
  Deno.env.get('RESEND_FROM') ?? 'Aroma Tales Orders <onboarding@resend.dev>';

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const auth = req.headers.get('Authorization') ?? '';
  const expected = NOTIFY_SECRET ? `Bearer ${NOTIFY_SECRET}` : '';
  if (!NOTIFY_SECRET || auth !== expected) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: { record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const record = payload.record;
  if (!record || typeof record !== 'object') {
    return new Response(JSON.stringify({ error: 'missing record' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const status = String(record.status ?? '');
  if (status === 'draft') {
    return new Response(JSON.stringify({ skipped: true, reason: 'draft' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!RESEND_KEY) {
    console.error('notify-new-order: RESEND_API_KEY not set');
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const orderNumber = esc(String(record.order_number ?? ''));
  const custEmail = esc(String(record.email ?? ''));
  const first = esc(String(record.first_name ?? ''));
  const last = esc(String(record.last_name ?? ''));
  const phone = esc(String(record.phone ?? ''));
  const total = record.total;
  const currency = esc(String(record.currency ?? 'PKR'));
  const payment = esc(String(record.payment_method ?? ''));
  const delivery = esc(String(record.delivery_method ?? ''));
  const address = esc(String(record.address_line ?? ''));
  const city = esc(String(record.city ?? ''));
  const postal = esc(String(record.postal_code ?? ''));

  const items = Array.isArray(record.line_items) ? record.line_items : [];
  const lines = items
    .map((li: Record<string, unknown>) => {
      const qty = li.quantity ?? '';
      const title = esc(String(li.product_title ?? li.product_slug ?? ''));
      const size = esc(String(li.size ?? ''));
      const lineTotal = li.line_total ?? '';
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${qty}× ${title} <span style="color:#888">(${size})</span></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">Rs.${lineTotal}</td></tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#ececec;font-family:system-ui,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(18,18,18,.08)">
    <tr><td style="background:#121212;color:#fff;padding:24px 28px;text-align:center">
      <div style="color:#B8860B;font-size:10px;letter-spacing:.35em;font-weight:bold;margin-bottom:8px">NEW ORDER</div>
      <div style="font-family:Georgia,serif;font-size:22px">#${orderNumber}</div>
    </td></tr>
    <tr><td style="height:3px;background:#B8860B"></td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 16px;color:#333;line-height:1.55"><strong>Customer</strong><br>${first} ${last}<br>${custEmail}<br>${phone}</p>
      <p style="margin:0 0 16px;color:#333;line-height:1.55"><strong>Ship to</strong><br>${address}<br>${city} ${postal}</p>
      <p style="margin:0 0 20px;color:#333"><strong>Payment</strong> ${payment} · <strong>Delivery</strong> ${delivery}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222">${lines}</table>
      <p style="margin:20px 0 0;font-size:18px;font-weight:600">Total: ${currency} ${total}</p>
    </td></tr>
  </table></td></tr></table></body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `New order #${record.order_number} · Aroma Tales`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend failed', res.status, text);
    return new Response(JSON.stringify({ error: text }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
