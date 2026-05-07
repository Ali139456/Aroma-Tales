import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, Home, Package } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const fromCheckout = Boolean(location.state?.fromCheckout);
  const offlineDemo = Boolean(location.state?.offline);

  const [celebrateOpen, setCelebrateOpen] = useState(fromCheckout);

  const displayOrder = useMemo(() => {
    const raw = location.state?.orderNumber;
    if (typeof raw === 'string' && raw.trim()) {
      const t = raw.trim();
      return t.startsWith('#') ? t : `#${t}`;
    }
    return null;
  }, [location.state]);

  useEffect(() => {
    setCelebrateOpen(fromCheckout);
  }, [fromCheckout]);

  useEffect(() => {
    if (!celebrateOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [celebrateOpen]);

  useEffect(() => {
    if (!celebrateOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setCelebrateOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [celebrateOpen]);

  return (
    <div className="page-order-success pt-28 sm:pt-36 pb-16 sm:pb-20 bg-white min-h-screen flex items-center justify-center">
      <AnimatePresence>
        {celebrateOpen && (
          <motion.div
            key="celebrate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10"
            role="presentation"
          >
            <button
              type="button"
              className="absolute inset-0 bg-dark/45 backdrop-blur-[3px] cursor-default border-0 p-0"
              aria-label="Close dialog"
              onClick={() => setCelebrateOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="order-success-modal relative z-[1] w-full max-w-[440px] rounded-[2rem] border border-dark/8 bg-white px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-14 text-center shadow-[0_24px_80px_-12px_rgba(18,18,18,0.25)] max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain"
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-placed-title"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="w-[5.5rem] h-[5.5rem] mx-auto mb-8 rounded-full bg-offwhite flex items-center justify-center border border-dark/5">
                <Package className="w-10 h-10 text-dark/22" strokeWidth={1.25} aria-hidden />
              </div>

              <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-dark/35 mb-3">
                Aroma Tales
              </p>
              <h2 id="order-placed-title" className="text-3xl md:text-[2.125rem] font-serif tracking-tight text-dark mb-4">
                Your order has been placed
              </h2>
              <p className="text-dark/50 font-light text-[15px] leading-relaxed mb-8">
                Thank you — our atelier will prepare your fragrances with care. You’ll hear from us soon with delivery updates.
              </p>

              {offlineDemo && (
                <p className="text-[11px] text-amber-900/80 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 font-medium leading-snug">
                  Demo mode: checkout ran without saving to the server. Connect Supabase to persist real orders.
                </p>
              )}

              {displayOrder && (
                <div className="rounded-2xl border border-dark/8 bg-offwhite/80 px-5 py-4 mb-8">
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/38 mb-2">
                    Order reference
                  </p>
                  <p className="font-mono text-sm md:text-base font-semibold text-dark tracking-wide">{displayOrder}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setCelebrateOpen(false)}
                  className="w-full py-4 rounded-full border border-dark/12 text-[11px] uppercase tracking-[0.28em] font-bold text-dark/65 hover:border-dark/25 hover:bg-offwhite transition-colors"
                >
                  View confirmation
                </button>
                <Link
                  to="/#collections"
                  className="w-full py-4 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.28em] font-bold hover:bg-gold hover:text-dark transition-colors shadow-lg inline-flex items-center justify-center gap-2"
                >
                  Explore collections
                  <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-offwhite p-8 sm:p-12 md:p-16 lg:p-20 rounded-[2rem] sm:rounded-[3rem] text-center space-y-8 sm:space-y-10 border border-dark/5 shadow-sm"
        >
          <div className="w-24 h-24 bg-dark text-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" strokeWidth={1.5} aria-hidden />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif">Order confirmed</h1>
            <p className="text-dark/50 text-lg sm:text-xl font-light px-2">
              Thank you for your purchase. Your olfactory journey has begun.
            </p>
          </div>

          {displayOrder ? (
            <div className="bg-white p-8 rounded-2xl border border-dark/5 max-w-md mx-auto">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-dark/40 uppercase tracking-widest text-[10px]">Order number</span>
                <span className="text-dark font-mono text-xs md:text-sm">{displayOrder}</span>
              </div>
            </div>
          ) : (
            <p className="text-dark/40 text-sm max-w-lg mx-auto leading-relaxed">
              Place an order from checkout to see your reference number here.
            </p>
          )}

          <p className="text-dark/40 text-sm max-w-lg mx-auto leading-relaxed">
            Our team may reach out via WhatsApp if we need anything else. Keep your order reference handy.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
            <Link
              to="/"
              className="w-full md:w-auto px-12 py-5 bg-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-gold transition-colors flex items-center justify-center gap-3 group shadow-xl"
            >
              <Home className="w-4 h-4" strokeWidth={1.5} aria-hidden />
              Return home
            </Link>
            <Link
              to="/#collections"
              className="w-full md:w-auto px-12 py-5 bg-white text-dark text-[11px] uppercase tracking-[0.3em] font-bold rounded-full border border-dark/10 hover:border-dark transition-colors flex items-center justify-center gap-3 group"
            >
              View collections
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
