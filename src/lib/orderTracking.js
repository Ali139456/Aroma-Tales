/** Normalize order number input for lookup (strip #, spaces). */
export function normalizeOrderNumberInput(raw) {
  if (raw === undefined || raw === null) return '';
  return String(raw)
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, '');
}

export function formatTrackingCurrency(amount, currency = 'PKR') {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  const sym = currency === 'PKR' ? 'Rs.' : `${currency} `;
  return `${sym}${Math.round(n).toLocaleString('en-PK')}`;
}

export function labelDeliveryMethod(id) {
  const m = {
    standard: 'Standard shipping',
    express: 'Express',
    pickup: 'Studio pickup',
  };
  return m[id] || id || '—';
}

export function labelPaymentMethod(id) {
  const m = {
    cod: 'Cash on delivery',
    wallet: 'Easypaisa / Jazzcash',
    manual: 'Manual payment',
  };
  return m[id] || id || '—';
}

export function labelOrderStatus(status) {
  const m = {
    pending: 'Pending confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    draft: 'Draft',
  };
  return m[status] || status || '—';
}

export function labelDeliveryStatus(ds) {
  const m = {
    pending: 'Awaiting dispatch',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return m[ds] || ds || '—';
}
