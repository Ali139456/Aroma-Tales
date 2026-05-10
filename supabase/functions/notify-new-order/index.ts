/**
 * Order emails via Resend: shop alert + customer confirmation on new orders;
 * customer updates when status / delivery changes (webhook UPDATE).
 *
 * Deploy: `supabase functions deploy notify-new-order --no-verify-jwt`
 * Secrets:
 *   supabase secrets set RESEND_API_KEY=re_xxx ORDER_NOTIFY_SECRET=long-random-string
 * Optional:
 *   SHOP_NOTIFY_EMAIL   (default info.aromatales@gmail.com)
 *   RESEND_FROM         (e.g. Aroma Tales <orders@aromatales.shop> — use your verified domain)
 *   STORE_URL           (default https://aromatales.shop) — links in customer emails
 *
 * Database webhooks (same URL + Authorization: Bearer <ORDER_NOTIFY_SECRET>):
 *   - INSERT on `orders`  → new pending order: shop + customer
 *   - UPDATE on `orders`  → customer lifecycle (confirm / ship / deliver / cancel); draft→pending → shop + customer
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
const NOTIFY_SECRET = Deno.env.get('ORDER_NOTIFY_SECRET');
const SHOP_TO = Deno.env.get('SHOP_NOTIFY_EMAIL') ?? 'info.aromatales@gmail.com';
const FROM =
  Deno.env.get('RESEND_FROM') ?? 'Aroma Tales <onboarding@resend.dev>';
const STORE_URL = (Deno.env.get('STORE_URL') ?? 'https://aromatales.shop').trim().replace(/\/$/, '');

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isProbablyEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function sendResend(to: string[], subject: string, html: string): Promise<Response> {
  return await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
}

function wrapEmail(inner: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#ececec;font-family:system-ui,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(18,18,18,.08)">
    ${inner}
  </table></td></tr></table></body></html>`;
}

function lineItemsHtml(record: Record<string, unknown>) {
  const items = Array.isArray(record.line_items) ? record.line_items : [];
  return items
    .map((li: Record<string, unknown>) => {
      const qty = li.quantity ?? '';
      const title = esc(String(li.product_title ?? li.product_slug ?? ''));
      const size = esc(String(li.size ?? ''));
      const lineTotal = li.line_total ?? '';
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${qty}× ${title} <span style="color:#888">(${size})</span></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">Rs.${lineTotal}</td></tr>`;
    })
    .join('');
}

function buildShopNewOrderHtml(record: Record<string, unknown>) {
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
  const lines = lineItemsHtml(record);

  const inner = `<tr><td style="background:#121212;color:#fff;padding:24px 28px;text-align:center">
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
    </td></tr>`;
  return wrapEmail(inner);
}

function buildCustomerOrderReceivedHtml(record: Record<string, unknown>) {
  const orderNumber = esc(String(record.order_number ?? ''));
  const first = esc(String(record.first_name ?? ''));
  const total = record.total;
  const currency = esc(String(record.currency ?? 'PKR'));
  const lines = lineItemsHtml(record);
  const inner = `<tr><td style="background:#121212;color:#fff;padding:24px 28px;text-align:center">
      <div style="color:#B8860B;font-size:10px;letter-spacing:.35em;font-weight:bold;margin-bottom:8px">THANK YOU</div>
      <div style="font-family:Georgia,serif;font-size:22px">Order #${orderNumber}</div>
    </td></tr>
    <tr><td style="height:3px;background:#B8860B"></td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 16px;color:#333;line-height:1.6">Hi ${first},</p>
      <p style="margin:0 0 20px;color:#333;line-height:1.6">We have received your order and will prepare it shortly. If anything looks wrong, reply to this email.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222">${lines}</table>
      <p style="margin:20px 0 16px;font-size:18px;font-weight:600">Total: ${currency} ${total}</p>
      <p style="margin:0"><a href="${esc(STORE_URL)}" style="color:#B8860B;font-weight:600">Visit our shop</a></p>
    </td></tr>`;
  return wrapEmail(inner);
}

function buildCustomerStatusHtml(
  headline: string,
  body: string,
  orderNumber: string,
) {
  const on = esc(orderNumber);
  const inner = `<tr><td style="background:#121212;color:#fff;padding:24px 28px;text-align:center">
      <div style="color:#B8860B;font-size:10px;letter-spacing:.35em;font-weight:bold;margin-bottom:8px">${esc(headline)}</div>
      <div style="font-family:Georgia,serif;font-size:22px">Order #${on}</div>
    </td></tr>
    <tr><td style="height:3px;background:#B8860B"></td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 16px;color:#333;line-height:1.6">${body}</p>
      <p style="margin:0"><a href="${esc(STORE_URL)}" style="color:#B8860B;font-weight:600">Visit our shop</a></p>
    </td></tr>`;
  return wrapEmail(inner);
}

async function requireOk(res: Response, label: string) {
  if (!res.ok) {
    const text = await res.text();
    console.error(label, res.status, text);
    throw new Error(`${label}: ${text}`);
  }
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

  let payload: {
    type?: string;
    record?: Record<string, unknown>;
    old_record?: Record<string, unknown> | null;
  };
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

  if (!RESEND_KEY) {
    console.error('notify-new-order: RESEND_API_KEY not set');
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const eventType = (payload.type ?? 'INSERT').toUpperCase();
  const status = String(record.status ?? '');
  const customerRaw = String(record.email ?? '').trim();
  const shopLower = SHOP_TO.trim().toLowerCase();
  const customerLower = customerRaw.toLowerCase();
  const sendCustomer = customerRaw && isProbablyEmail(customerRaw);
  const customerDistinctFromShop = customerLower !== shopLower;

  const sent: string[] = [];

  try {
    if (eventType === 'INSERT') {
      if (status === 'draft') {
        return new Response(JSON.stringify({ skipped: true, reason: 'draft' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await requireOk(
        await sendResend(
          [SHOP_TO],
          `New order #${record.order_number} · Aroma Tales`,
          buildShopNewOrderHtml(record),
        ),
        'Resend shop',
      );
      sent.push('shop_new_order');

      if (sendCustomer && customerDistinctFromShop) {
        await requireOk(
          await sendResend(
            [customerRaw],
            `We received your order #${record.order_number} · Aroma Tales`,
            buildCustomerOrderReceivedHtml(record),
          ),
          'Resend customer insert',
        );
        sent.push('customer_order_received');
      } else if (sendCustomer && !customerDistinctFromShop) {
        await requireOk(
          await sendResend(
            [customerRaw],
            `New order #${record.order_number} · Aroma Tales`,
            buildShopNewOrderHtml(record),
          ),
          'Resend shop self-order',
        );
        sent.push('shop_only_same_email');
      }

      return new Response(JSON.stringify({ ok: true, sent }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (eventType === 'UPDATE') {
      const old = payload.old_record;
      if (!old || typeof old !== 'object') {
        return new Response(JSON.stringify({ skipped: true, reason: 'no old_record' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const oldS = String(old.status ?? '');
      const newS = String(record.status ?? '');
      const oldD = String(old.delivery_status ?? '');
      const newD = String(record.delivery_status ?? '');
      const on = String(record.order_number ?? '');

      if (newS === 'draft') {
        return new Response(JSON.stringify({ skipped: true, reason: 'still draft' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // CRM: draft promoted to pending — same as checkout for notifications
      if (oldS === 'draft' && newS === 'pending') {
        await requireOk(
          await sendResend(
            [SHOP_TO],
            `New order #${record.order_number} · Aroma Tales`,
            buildShopNewOrderHtml(record),
          ),
          'Resend shop draft→pending',
        );
        sent.push('shop_new_order');
        if (sendCustomer && customerDistinctFromShop) {
          await requireOk(
            await sendResend(
              [customerRaw],
              `We received your order #${record.order_number} · Aroma Tales`,
              buildCustomerOrderReceivedHtml(record),
            ),
            'Resend customer draft→pending',
          );
          sent.push('customer_order_received');
        }
        return new Response(JSON.stringify({ ok: true, sent }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!sendCustomer) {
        return new Response(JSON.stringify({ skipped: true, reason: 'no customer email' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const orderRef = on;

      if (oldS !== 'cancelled' && newS === 'cancelled') {
        const html = buildCustomerStatusHtml(
          'ORDER CANCELLED',
          `Your order <strong>#${esc(orderRef)}</strong> has been cancelled. If you did not request this, please contact us.`,
          orderRef,
        );
        await requireOk(
          await sendResend([customerRaw], `Order #${orderRef} cancelled · Aroma Tales`, html),
          'Resend cancelled',
        );
        sent.push('customer_cancelled');
      } else if (oldS !== 'confirmed' && newS === 'confirmed') {
        const html = buildCustomerStatusHtml(
          'ORDER CONFIRMED',
          `Your order <strong>#${esc(orderRef)}</strong> is confirmed. We will notify you when it ships.`,
          orderRef,
        );
        await requireOk(
          await sendResend([customerRaw], `Order #${orderRef} confirmed · Aroma Tales`, html),
          'Resend confirmed',
        );
        sent.push('customer_confirmed');
      }

      if (newS !== 'cancelled') {
        if (oldD !== 'shipped' && newD === 'shipped') {
          const html = buildCustomerStatusHtml(
            'ON THE WAY',
            `Your order <strong>#${esc(orderRef)}</strong> has shipped. Thank you for shopping with Aroma Tales.`,
            orderRef,
          );
          await requireOk(
            await sendResend([customerRaw], `Order #${orderRef} shipped · Aroma Tales`, html),
            'Resend shipped',
          );
          sent.push('customer_shipped');
        } else if (oldD !== 'delivered' && newD === 'delivered') {
          const html = buildCustomerStatusHtml(
            'DELIVERED',
            `Your order <strong>#${esc(orderRef)}</strong> is marked as delivered. We hope you love it.`,
            orderRef,
          );
          await requireOk(
            await sendResend([customerRaw], `Order #${orderRef} delivered · Aroma Tales`, html),
            'Resend delivered',
          );
          sent.push('customer_delivered');
        } else if (oldD !== 'processing' && newD === 'processing') {
          const html = buildCustomerStatusHtml(
            'PROCESSING',
            `Your order <strong>#${esc(orderRef)}</strong> is now being prepared.`,
            orderRef,
          );
          await requireOk(
            await sendResend([customerRaw], `Order #${orderRef} is being prepared · Aroma Tales`, html),
            'Resend processing',
          );
          sent.push('customer_processing');
        }
      }

      if (sent.length === 0) {
        return new Response(
          JSON.stringify({ skipped: true, reason: 'no customer-relevant field change' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(JSON.stringify({ ok: true, sent }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ skipped: true, reason: `unsupported type ${eventType}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
