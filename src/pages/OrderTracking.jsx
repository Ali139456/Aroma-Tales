import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Package,
  Search,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  normalizeOrderNumberInput,
  formatTrackingCurrency,
  labelDeliveryMethod,
  labelPaymentMethod,
  labelOrderStatus,
  labelDeliveryStatus,
} from '../lib/orderTracking';
import { BUSINESS_PHONE_DISPLAY, BUSINESS_WHATSAPP_DIGITS } from '../lib/contactInfo';

function parseLineItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function buildSteps(order) {
  const cancelled =
    order.status === 'cancelled' || order.delivery_status === 'cancelled';
  if (cancelled) {
    return {
      cancelled: true,
      steps: [],
    };
  }

  const st = order.status;
  const ds = order.delivery_status;

  const confirmed = st === 'confirmed';
  const inTransit =
    ds === 'processing' || ds === 'shipped' || ds === 'delivered';
  const delivered = ds === 'delivered';

  let transitLabel = 'Shipped';
  let transitSub = 'On the way to you';
  if (ds === 'processing') {
    transitLabel = 'Processing';
    transitSub = 'We are preparing your parcel';
  } else if (ds === 'shipped') {
    transitLabel = 'Shipped';
    transitSub = 'Handed to courier';
  } else if (ds === 'delivered') {
    transitLabel = 'Shipped';
    transitSub = 'Delivered to your address';
  } else {
    transitLabel = 'Dispatch';
    transitSub = 'Not yet shipped';
  }

  const steps = [
    {
      key: 'placed',
      label: 'Order placed',
      sub: 'We received your details',
      done: true,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      sub: 'Your order is locked in',
      done: confirmed,
    },
    {
      key: 'transit',
      label: transitLabel,
      sub: transitSub,
      done: inTransit,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      sub: 'Enjoy your extracts',
      done: delivered,
    },
  ];

  return { cancelled: false, steps };
}

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [orderInput, setOrderInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    const q = searchParams.get('order');
    if (q) setOrderInput(normalizeOrderNumberInput(decodeURIComponent(q)));
    const pre = location.state?.prefillOrder;
    if (pre) setOrderInput(normalizeOrderNumberInput(pre));
  }, [searchParams, location.state]);

  const timeline = useMemo(() => (order ? buildSteps(order) : null), [order]);

  const runLookup = useCallback(async () => {
    setLookupError('');
    setOrder(null);

    if (!isSupabaseConfigured || !supabase) {
      setLookupError(
        'Order tracking needs Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then apply the order-tracking migration.',
      );
      return;
    }

    const num = normalizeOrderNumberInput(orderInput);
    const em = emailInput.trim();
    if (!num || !em) {
      setLookupError('Enter your order number and the email you used at checkout.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_order_for_tracking', {
        p_order_number: num,
        p_email: em,
      });

      if (error) {
        const msg = error.message || String(error);
        if (/function|schema cache|does not exist/i.test(msg)) {
          setLookupError(
            'Tracking is not available yet on this database. Ask your admin to run supabase/migrations/007_order_tracking_rpc.sql.',
          );
        } else {
          setLookupError(msg);
        }
        setLoading(false);
        return;
      }

      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        setLookupError(
          'No order matches that number and email. Check for typos, or use the same email you entered at checkout.',
        );
        setLoading(false);
        return;
      }

      setOrder(data);
    } catch (e) {
      setLookupError(e?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }, [orderInput, emailInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runLookup();
  };

  const lines = order ? parseLineItems(order.line_items) : [];

  return (
    <div className="page-order-track pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-24 bg-offwhite min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-3xl">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-bold text-dark/40 hover:text-dark transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} aria-hidden />
          Back to shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-gold mb-3">After checkout</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4 leading-tight">Track your order</h1>
          <p className="text-dark/55 font-light text-base sm:text-lg mb-12 max-w-xl leading-relaxed">
            Enter the order number from your confirmation and the email address used at checkout. We never show an order
            unless both match.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-dark/8 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm mb-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="track-order-number" className="block text-[10px] uppercase tracking-[0.28em] font-bold text-dark/40 mb-2">
                Order number
              </label>
              <input
                id="track-order-number"
                type="text"
                autoComplete="off"
                placeholder="e.g. 042"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                className="w-full bg-offwhite border border-dark/8 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-dark/25 transition-colors font-mono"
              />
            </div>
            <div>
              <label htmlFor="track-email" className="block text-[10px] uppercase tracking-[0.28em] font-bold text-dark/40 mb-2">
                Email
              </label>
              <input
                id="track-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-offwhite border border-dark/8 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-dark/25 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.28em] font-bold hover:bg-gold hover:text-dark transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-lg"
            >
              {loading ? (
                'Looking up…'
              ) : (
                <>
                  <Search className="w-4 h-4" strokeWidth={2} aria-hidden />
                  Track order
                </>
              )}
            </button>
          </form>

          {lookupError && (
            <div
              className="mt-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950/90"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
              <p className="leading-relaxed">{lookupError}</p>
            </div>
          )}
        </motion.div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="bg-white border border-dark/8 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-6 border-b border-dark/8 pb-8 mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-2">Order</p>
                  <p className="font-mono text-2xl sm:text-3xl font-semibold text-dark">#{order.order_number}</p>
                  <p className="text-sm text-dark/50 mt-2">
                    Placed{' '}
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString('en-PK', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38">Total</p>
                  <p className="text-2xl font-serif">{formatTrackingCurrency(order.total, order.currency)}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 text-sm mb-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-1">Order status</p>
                  <p className="font-medium text-dark">{labelOrderStatus(order.status)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-1">Delivery</p>
                  <p className="font-medium text-dark">{labelDeliveryStatus(order.delivery_status)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-1">Fulfillment</p>
                  <p className="font-medium text-dark capitalize">{order.fulfillment_status || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-1">Ship to</p>
                  <p className="font-medium text-dark leading-relaxed">
                    {[order.first_name, order.last_name].filter(Boolean).join(' ')}
                    <br />
                    <span className="text-dark/65 font-normal">
                      {[order.address_line, order.city, order.postal_code].filter(Boolean).join(', ')}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-1">Delivery method</p>
                  <p className="font-medium text-dark">{labelDeliveryMethod(order.delivery_method)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-1">Payment</p>
                  <p className="font-medium text-dark">{labelPaymentMethod(order.payment_method)}</p>
                </div>
              </div>

              {timeline?.cancelled ? (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-950/90">
                  This order was cancelled. If you believe this is a mistake, contact us with your order number.
                </div>
              ) : (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-6">Progress</p>
                  <ul className="space-y-0">
                    {timeline?.steps?.map((step, i) => (
                      <li key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center shrink-0 w-8">
                          {step.done ? (
                            <CheckCircle2 className="w-7 h-7 text-gold" strokeWidth={1.5} aria-hidden />
                          ) : (
                            <Circle className="w-7 h-7 text-dark/15" strokeWidth={1.25} aria-hidden />
                          )}
                          {i < timeline.steps.length - 1 && (
                            <div
                              className={`w-px h-6 my-0.5 ${
                                step.done && timeline.steps[i + 1]?.done ? 'bg-gold/45' : 'bg-dark/10'
                              }`}
                              aria-hidden
                            />
                          )}
                        </div>
                        <div className={`pb-8 ${i === timeline.steps.length - 1 ? 'pb-0' : ''}`}>
                          <p className={`font-medium ${step.done ? 'text-dark' : 'text-dark/40'}`}>{step.label}</p>
                          <p className="text-sm text-dark/45 mt-1">{step.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-white border border-dark/8 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Package className="w-5 h-5 text-dark/35" strokeWidth={1.5} aria-hidden />
                <h2 className="text-xl font-serif">Items</h2>
              </div>
              {lines.length === 0 ? (
                <p className="text-sm text-dark/45">No line items were stored for this order.</p>
              ) : (
                <ul className="divide-y divide-dark/8">
                  {lines.map((row, idx) => (
                    <li key={`${row.product_slug || idx}-${idx}`} className="flex gap-4 py-5 first:pt-0">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-offwhite border border-dark/8 shrink-0">
                        {row.image ? (
                          <img src={row.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark/20">
                            <Package className="w-6 h-6" strokeWidth={1} aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark truncate">{row.product_title || 'Product'}</p>
                        <p className="text-[11px] uppercase tracking-widest text-dark/40 mt-1">
                          {row.size || '—'} × {row.quantity ?? 1}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium tabular-nums">
                          {formatTrackingCurrency(row.line_total ?? row.unit_price, order.currency)}
                        </p>
                        {row.unit_price != null && Number(row.quantity) > 1 && (
                          <p className="text-[11px] text-dark/40 mt-1 tabular-nums">
                            {formatTrackingCurrency(row.unit_price, order.currency)} each
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 pt-8 border-t border-dark/8 space-y-2 text-sm">
                <div className="flex justify-between text-dark/55">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatTrackingCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-dark/55">
                  <span>Shipping</span>
                  <span className="tabular-nums">{formatTrackingCurrency(order.shipping_total, order.currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2">
                  <span>Total</span>
                  <span className="tabular-nums font-serif">{formatTrackingCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-dark/8 bg-white px-6 py-5">
              <div className="flex items-start gap-3 text-sm text-dark/60">
                <Truck className="w-5 h-5 shrink-0 text-dark/35 mt-0.5" strokeWidth={1.5} aria-hidden />
                <p>
                  Questions about this order?{' '}
                  <a
                    href={`https://wa.me/${BUSINESS_WHATSAPP_DIGITS}`}
                    className="font-medium text-dark underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp {BUSINESS_PHONE_DISPLAY}
                  </a>
                </p>
              </div>
              <Link
                to="/contact"
                className="shrink-0 text-center text-[11px] uppercase tracking-[0.22em] font-bold text-dark border border-dark/15 rounded-full px-6 py-3 hover:bg-dark hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default OrderTracking;
