import React, { useMemo, useState } from 'react';
import { Download, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { rowsToCsv, downloadTextFile } from '../../lib/csvExport';
import { getEffectivePrices } from '../../lib/productMapper';

function fmtPk(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(ts);
  }
}

function paymentLabel(method) {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'wallet') return 'Easypaisa / Jazzcash';
  if (method === 'manual') return 'Manual / Draft';
  return method || '—';
}

function deliveryLabel(method) {
  if (method === 'standard') return 'Standard (free)';
  if (method === 'express') return 'Express';
  if (method === 'pickup') return 'Pickup';
  return method || '—';
}

/** Tailwind classes: tinted surface + border + focus ring per ship milestone */
function shipStatusSelectTone(status) {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-900 border-emerald-300/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25';
    case 'shipped':
      return 'bg-sky-50 text-sky-900 border-sky-300/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25';
    case 'processing':
      return 'bg-orange-50 text-orange-900 border-orange-300/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25';
    case 'pending':
      return 'bg-amber-50 text-amber-950 border-amber-300/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25';
    case 'cancelled':
      return 'bg-red-50 text-red-900 border-red-300/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/25';
    default:
      return 'bg-white text-dark border-dark/15 focus:border-dark focus:ring-2 focus:ring-dark/10';
  }
}

function fulfillmentSelectTone(status) {
  switch (status) {
    case 'fulfilled':
      return 'bg-emerald-50 text-emerald-900 border-emerald-300/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25';
    case 'partial':
      return 'bg-orange-50 text-orange-900 border-orange-300/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25';
    case 'unfulfilled':
    default:
      return 'bg-amber-50 text-amber-950 border-amber-300/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25';
  }
}

export default function OrdersAdminSection({
  supabase,
  catalogAll,
  orders,
  ordersLoading,
  refreshOrders,
  inputCls,
  setCrmError,
  busy,
  setBusy,
}) {
  const selectFieldCls = inputCls.includes('px-4')
    ? `${inputCls.replace(/\bpx-4\b/, 'ps-4')} pe-10`
    : `${inputCls} pe-10`;

  const [sortDesc, setSortDesc] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    delivery_method: 'standard',
    payment_method: 'manual',
    notes: '',
  });
  const [draftLines, setDraftLines] = useState([]);
  const [draftPickSlug, setDraftPickSlug] = useState('');
  const [draftPickSize, setDraftPickSize] = useState('30ml');
  const [draftPickQty, setDraftPickQty] = useState('1');

  const sortedOrders = useMemo(() => {
    const arr = [...(orders || [])];
    arr.sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return sortDesc ? tb - ta : ta - tb;
    });
    return arr.filter((o) => {
      if (statusFilter === 'all') return true;
      return (o.status || '') === statusFilter;
    });
  }, [orders, sortDesc, statusFilter]);

  const exportOrdersCsv = () => {
    const header = [
      'Order Id',
      'Order Number',
      'Order Date',
      'Status',
      'Email',
      'First Name',
      'Last Name',
      'Phone',
      'Total',
      'Currency',
      'Address',
      'City',
      'Postal Code',
      'Payment Method',
      'Fulfillment Status',
      'Delivery Status',
      'Delivery Method',
      'Line Items Summary',
    ];
    const rows = sortedOrders.map((o) => {
      const items = Array.isArray(o.line_items) ? o.line_items : [];
      const summary = items
        .map((li) => `${li.quantity}× ${li.product_title || li.product_slug || ''} (${li.size})`)
        .join('; ');
      return [
        o.id,
        o.order_number,
        o.created_at,
        o.status,
        o.email,
        o.first_name,
        o.last_name,
        o.phone,
        o.total,
        o.currency,
        o.address_line,
        o.city,
        o.postal_code,
        paymentLabel(o.payment_method),
        o.fulfillment_status,
        o.delivery_status,
        deliveryLabel(o.delivery_method),
        summary,
      ];
    });
    downloadTextFile(`orders-export-${Date.now()}.csv`, rowsToCsv([header, ...rows]));
  };

  const patchOrder = async (id, patch) => {
    if (!supabase) return;
    setBusy(true);
    setCrmError('');
    try {
      const { error } = await supabase
        .from('orders')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await refreshOrders();
    } catch (err) {
      setCrmError(err.message || String(err));
    }
    setBusy(false);
  };

  const saveDraftOrder = async () => {
    if (!supabase) return;
    if (!draftCustomer.email.trim()) {
      setCrmError('Draft order requires a customer email.');
      return;
    }
    if (!draftLines.length) {
      setCrmError('Add at least one product line to the draft.');
      return;
    }
    const subtotal = draftLines.reduce((s, li) => s + li.line_total, 0);
    const shipping = 0;
    setBusy(true);
    setCrmError('');
    try {
      const { error } = await supabase.from('orders').insert({
        status: 'draft',
        fulfillment_status: 'unfulfilled',
        delivery_status: 'pending',
        delivery_method: draftCustomer.delivery_method,
        payment_method: draftCustomer.payment_method,
        email: draftCustomer.email.trim(),
        first_name: draftCustomer.firstName.trim(),
        last_name: draftCustomer.lastName.trim(),
        phone: draftCustomer.phone.trim(),
        address_line: draftCustomer.address.trim(),
        city: draftCustomer.city.trim(),
        postal_code: draftCustomer.postalCode.trim(),
        line_items: draftLines,
        subtotal,
        shipping_total: shipping,
        total: subtotal + shipping,
        currency: 'PKR',
        notes: draftCustomer.notes.trim() || null,
      });
      if (error) throw error;
      setDraftOpen(false);
      setDraftLines([]);
      setDraftCustomer({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        delivery_method: 'standard',
        payment_method: 'manual',
        notes: '',
      });
      await refreshOrders();
    } catch (err) {
      setCrmError(err.message || String(err));
    }
    setBusy(false);
  };

  const addDraftLine = () => {
    const product = catalogAll.find((p) => p.id === draftPickSlug);
    if (!product) {
      setCrmError('Pick a product from the list.');
      return;
    }
    const qty = Math.max(1, parseInt(draftPickQty, 10) || 1);
    const { price, price30ml } = getEffectivePrices(product);
    const unit = draftPickSize === '30ml' ? price30ml : price;
    const line_total = unit * qty;
    setDraftLines((prev) => [
      ...prev,
      {
        product_slug: product.id,
        product_title: product.name,
        size: draftPickSize,
        quantity: qty,
        unit_price: unit,
        line_total,
        image: product.image || null,
      },
    ]);
    setCrmError('');
  };

  const removeDraftLine = (idx) => {
    setDraftLines((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40">Orders</p>
          <p className="text-sm text-dark/50 mt-1 font-light">
            Shopify-style list · delivery · draft invoices · CSV export
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            disabled={busy || !supabase || ordersLoading}
            onClick={() => refreshOrders()}
            className="px-5 py-3 rounded-full border border-dark/12 text-[10px] uppercase tracking-[0.2em] font-bold text-dark/70 hover:bg-white transition-colors disabled:opacity-40"
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={busy || !sortedOrders.length}
            onClick={exportOrdersCsv}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-dark text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-dark transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            Download CSV
          </button>
          <button
            type="button"
            disabled={busy || !supabase}
            onClick={() => setDraftOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-dark/18 text-[10px] uppercase tracking-[0.2em] font-bold text-dark hover:bg-dark hover:text-white transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Draft order
          </button>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-white/60 bg-gradient-to-b from-[#ececec] to-[#e4e4e5] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] md:px-8 md:py-6">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-5 md:gap-x-12 md:gap-y-4">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-dark/45">
              Filter
            </span>
            <div className="relative min-w-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter orders by status"
                className="min-h-[46px] min-w-[min(100vw-4rem,220px)] appearance-none rounded-full border border-transparent bg-white py-3 pl-5 pr-12 text-[13px] font-medium text-dark/55 shadow-[0_2px_8px_-2px_rgba(18,18,18,0.12)] outline-none transition-[box-shadow,border-color] hover:shadow-[0_4px_14px_-4px_rgba(18,18,18,0.14)] focus:border-dark/10 focus:ring-2 focus:ring-dark/8 sm:min-w-[220px]"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div
            className="hidden flex-col items-center justify-end pb-[11px] text-center sm:flex"
            aria-hidden
          >
            <span className="text-[10px] uppercase tracking-[0.35em] font-bold leading-none text-dark/38">
              Sort
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.35em] font-bold leading-none text-dark/38">
              date
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.32em] font-bold text-dark/45 sm:invisible sm:select-none sm:h-[15px]">
              Sort date
            </span>
            <div className="relative min-w-0">
              <select
                value={sortDesc ? 'newest' : 'oldest'}
                onChange={(e) => setSortDesc(e.target.value === 'newest')}
                aria-label="Sort orders by date"
                className="min-h-[46px] min-w-[min(100vw-4rem,220px)] appearance-none rounded-full border border-dark/22 bg-white py-3 pl-5 pr-12 text-[13px] font-medium text-dark/55 shadow-[0_2px_8px_-2px_rgba(18,18,18,0.1)] outline-none ring-1 ring-dark/5 transition-[box-shadow,border-color] hover:border-dark/30 hover:shadow-[0_4px_14px_-4px_rgba(18,18,18,0.12)] focus:border-dark/35 focus:ring-2 focus:ring-dark/12 sm:min-w-[220px]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dark/5 shadow-sm overflow-hidden min-w-0">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-0 text-sm">
            <thead>
              <tr className="border-b border-dark/5 text-left text-[10px] uppercase tracking-[0.2em] text-dark/35 font-bold">
                <th className="px-2 lg:px-3 py-3 w-10 shrink-0" />
                <th className="px-2 lg:px-3 py-3 whitespace-nowrap">Order #</th>
                <th className="px-2 lg:px-3 py-3 whitespace-nowrap">Date</th>
                <th className="px-2 lg:px-3 py-3">Customer</th>
                <th className="px-2 lg:px-3 py-3">Email</th>
                <th className="px-2 lg:px-3 py-3 whitespace-nowrap tabular-nums">Total</th>
                <th className="px-2 lg:px-3 py-3">Payment</th>
                <th className="px-2 lg:px-3 py-3 whitespace-nowrap">Fulfillment</th>
                <th className="px-2 lg:px-3 py-3">Delivery</th>
                <th className="px-2 lg:px-3 py-3">Ship status</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading && (
                <tr>
                  <td colSpan={10} className="px-4 lg:px-6 py-10 text-center text-dark/45 font-light">
                    Loading orders…
                  </td>
                </tr>
              )}
              {!ordersLoading && !sortedOrders.length && (
                <tr>
                  <td colSpan={10} className="px-4 lg:px-6 py-10 text-center text-dark/45 font-light">
                    No orders yet. Checkout will create rows once Supabase migration is applied.
                  </td>
                </tr>
              )}
              {!ordersLoading &&
                sortedOrders.map((o) => {
                  const open = expandedId === o.id;
                  const name = `${o.first_name || ''} ${o.last_name || ''}`.trim() || '—';
                  const items = Array.isArray(o.line_items) ? o.line_items : [];
                  return (
                    <React.Fragment key={o.id}>
                      <tr className="border-b border-dark/5 hover:bg-offwhite/80 transition-colors align-top">
                        <td className="px-2 lg:px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(open ? null : o.id)}
                            className="w-9 h-9 rounded-full border border-dark/10 flex items-center justify-center text-dark/50 hover:bg-dark hover:text-white transition-colors"
                            aria-expanded={open}
                          >
                            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-2 lg:px-3 py-3 font-mono text-[11px] lg:text-xs font-semibold min-w-0 truncate" title={o.order_number}>
                          {o.order_number}
                        </td>
                        <td className="px-2 lg:px-3 py-3 text-xs text-dark/55 whitespace-nowrap">{fmtPk(o.created_at)}</td>
                        <td className="px-2 lg:px-3 py-3 font-medium text-xs min-w-0 truncate" title={name}>
                          {name}
                        </td>
                        <td className="px-2 lg:px-3 py-3 text-xs text-dark/55 min-w-0 truncate" title={o.email || ''}>
                          {o.email || '—'}
                        </td>
                        <td className="px-2 lg:px-3 py-3 tabular-nums font-medium text-xs whitespace-nowrap">
                          Rs.{Number(o.total || 0).toLocaleString()}
                        </td>
                        <td
                          className="px-2 lg:px-3 py-3 text-[10px] uppercase tracking-wide font-bold text-dark/45 min-w-0 truncate"
                          title={paymentLabel(o.payment_method)}
                        >
                          {paymentLabel(o.payment_method)}
                        </td>
                        <td className="px-2 lg:px-3 py-3 min-w-0">
                          <select
                            disabled={busy || o.status === 'draft'}
                            aria-label="Fulfillment status"
                            className={`${selectFieldCls} py-2 text-xs min-w-0 w-full max-w-full uppercase tracking-wide font-bold transition-colors disabled:opacity-55 disabled:saturate-75 ${fulfillmentSelectTone(o.fulfillment_status || 'unfulfilled')}`}
                            value={o.fulfillment_status || 'unfulfilled'}
                            onChange={(e) =>
                              patchOrder(o.id, { fulfillment_status: e.target.value })
                            }
                          >
                            <option value="unfulfilled">Unfulfilled</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="partial">Partial</option>
                          </select>
                        </td>
                        <td
                          className="px-2 lg:px-3 py-3 text-[10px] min-w-0 truncate"
                          title={deliveryLabel(o.delivery_method)}
                        >
                          {deliveryLabel(o.delivery_method)}
                        </td>
                        <td className="px-2 lg:px-3 py-3 min-w-0">
                          <select
                            disabled={busy || o.status === 'draft'}
                            aria-label="Ship status"
                            className={`${selectFieldCls} py-2 text-xs min-w-0 w-full max-w-full font-semibold transition-colors disabled:opacity-55 disabled:saturate-75 ${shipStatusSelectTone(o.delivery_status || 'pending')}`}
                            value={o.delivery_status || 'pending'}
                            onChange={(e) =>
                              patchOrder(o.id, { delivery_status: e.target.value })
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-offwhite/80 border-b border-dark/5">
                          <td colSpan={10} className="px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
                              <div className="space-y-3">
                                {o.status === 'draft' && (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      patchOrder(o.id, {
                                        status: 'pending',
                                        fulfillment_status: 'unfulfilled',
                                      })
                                    }
                                    className="mb-2 text-[10px] uppercase tracking-wider font-bold text-gold hover:underline"
                                  >
                                    Convert draft to order
                                  </button>
                                )}
                                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-dark/35">
                                  Shipping
                                </p>
                                <p className="text-dark/70 whitespace-pre-wrap leading-relaxed">
                                  {o.address_line || '—'}
                                  <br />
                                  {o.city} {o.postal_code}
                                  <br />
                                  Phone: {o.phone || '—'}
                                </p>
                                <p className="text-xs text-dark/45">
                                  Internal ID: <span className="font-mono">{o.id}</span>
                                </p>
                                {o.notes && (
                                  <p className="text-xs text-dark/55 italic border-l-2 border-gold pl-3">
                                    {o.notes}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-3">
                                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-dark/35">
                                  Line items
                                </p>
                                <ul className="space-y-2">
                                  {items.length === 0 && (
                                    <li className="text-dark/45 text-xs">No line items stored.</li>
                                  )}
                                  {items.map((li, idx) => (
                                    <li
                                      key={`${li.product_slug}-${li.size}-${idx}`}
                                      className="flex justify-between gap-4 text-xs border-b border-dark/5 pb-2"
                                    >
                                      <span>
                                        {li.quantity}× {li.product_title}{' '}
                                        <span className="text-dark/40">({li.size})</span>
                                      </span>
                                      <span className="tabular-nums font-medium">
                                        Rs.{Number(li.line_total || 0).toLocaleString()}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="flex justify-between text-sm pt-2 font-serif">
                                  <span className="text-dark/45">Total</span>
                                  <span className="tabular-nums">Rs.{Number(o.total || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {draftOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[220] bg-dark/50 backdrop-blur-sm px-4 py-10 overflow-y-auto overscroll-y-contain flex items-start justify-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDraftOpen(false);
          }}
        >
          <div
            className="bg-offwhite rounded-[1.75rem] border border-dark/10 shadow-2xl max-w-2xl w-full my-8 overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-dark/8 bg-white flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-gold">Draft</p>
                <h3 className="text-xl font-serif mt-1">Create draft order</h3>
              </div>
              <button
                type="button"
                onClick={() => setDraftOpen(false)}
                className="text-[11px] uppercase tracking-wider font-bold text-dark/45 hover:text-dark"
              >
                Close
              </button>
            </div>
            <div
              data-lenis-prevent
              className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto overscroll-contain touch-pan-y"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className={inputCls}
                  placeholder="Email *"
                  value={draftCustomer.email}
                  onChange={(e) => setDraftCustomer((s) => ({ ...s, email: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Phone"
                  value={draftCustomer.phone}
                  onChange={(e) => setDraftCustomer((s) => ({ ...s, phone: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="First name"
                  value={draftCustomer.firstName}
                  onChange={(e) => setDraftCustomer((s) => ({ ...s, firstName: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Last name"
                  value={draftCustomer.lastName}
                  onChange={(e) => setDraftCustomer((s) => ({ ...s, lastName: e.target.value }))}
                />
              </div>
              <input
                className={inputCls}
                placeholder="Street address"
                value={draftCustomer.address}
                onChange={(e) => setDraftCustomer((s) => ({ ...s, address: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className={inputCls}
                  placeholder="City"
                  value={draftCustomer.city}
                  onChange={(e) => setDraftCustomer((s) => ({ ...s, city: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder="Postal code"
                  value={draftCustomer.postalCode}
                  onChange={(e) => setDraftCustomer((s) => ({ ...s, postalCode: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="text-[10px] uppercase font-bold text-dark/40">Delivery method</span>
                  <select
                    className={selectFieldCls}
                    value={draftCustomer.delivery_method}
                    onChange={(e) =>
                      setDraftCustomer((s) => ({ ...s, delivery_method: e.target.value }))
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-[10px] uppercase font-bold text-dark/40">Payment (draft)</span>
                  <select
                    className={selectFieldCls}
                    value={draftCustomer.payment_method}
                    onChange={(e) =>
                      setDraftCustomer((s) => ({ ...s, payment_method: e.target.value }))
                    }
                  >
                    <option value="manual">Manual / Invoice</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="wallet">Easypaisa / Jazzcash</option>
                  </select>
                </label>
              </div>
              <textarea
                className={`${inputCls} min-h-[72px]`}
                placeholder="Staff notes"
                value={draftCustomer.notes}
                onChange={(e) => setDraftCustomer((s) => ({ ...s, notes: e.target.value }))}
              />

              <div className="border border-dark/8 rounded-2xl p-5 bg-white space-y-4">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-dark/35">
                  Add products
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                  <select
                    className={`${selectFieldCls} flex-1 min-w-[200px]`}
                    value={draftPickSlug}
                    onChange={(e) => setDraftPickSlug(e.target.value)}
                  >
                    <option value="">Select product…</option>
                    {catalogAll.map((p) => (
                      <option key={p.uuid || p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${selectFieldCls} w-28 shrink-0`}
                    value={draftPickSize}
                    onChange={(e) => setDraftPickSize(e.target.value)}
                  >
                    <option value="30ml">30ml</option>
                    <option value="50ml">50ml</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    className={`${inputCls} w-24 tabular-nums`}
                    value={draftPickQty}
                    onChange={(e) => setDraftPickQty(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addDraftLine}
                    className="px-5 py-3 rounded-full bg-dark text-white text-[10px] uppercase tracking-wider font-bold hover:bg-gold hover:text-dark transition-colors"
                  >
                    Add line
                  </button>
                </div>
                <ul className="divide-y divide-dark/5">
                  {draftLines.map((li, idx) => (
                    <li key={`${li.product_slug}-${idx}`} className="py-3 flex justify-between gap-4 text-sm">
                      <span>
                        {li.quantity}× {li.product_title}{' '}
                        <span className="text-dark/40">({li.size})</span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="tabular-nums">Rs.{li.line_total}</span>
                        <button
                          type="button"
                          onClick={() => removeDraftLine(idx)}
                          className="text-[10px] uppercase font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-right font-serif text-lg tabular-nums pt-2 border-t border-dark/5">
                  Draft total Rs.
                  {draftLines.reduce((s, li) => s + li.line_total, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-dark/8 bg-white flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDraftOpen(false)}
                className="px-6 py-3 rounded-full border border-dark/12 text-[11px] uppercase tracking-wider font-bold text-dark/55"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={saveDraftOrder}
                className="px-8 py-3 rounded-full bg-dark text-white text-[11px] uppercase tracking-wider font-bold hover:bg-gold hover:text-dark disabled:opacity-40"
              >
                Save draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
