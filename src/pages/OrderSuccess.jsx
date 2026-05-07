import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

const OrderSuccess = () => {
  const orderNumber = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="pt-40 pb-20 bg-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-10 md:px-24 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-offwhite p-12 md:p-20 rounded-[3rem] text-center space-y-10 border border-dark/5 shadow-sm"
        >
          <div className="w-24 h-24 bg-dark text-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif">Order Confirmed</h1>
            <p className="text-dark/50 text-xl font-light">
              Thank you for your purchase. Your olfactory journey has begun.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-dark/5 max-w-md mx-auto">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-dark/40 uppercase tracking-widest text-[10px]">Order Number</span>
              <span className="text-dark">#AT-{orderNumber}</span>
            </div>
          </div>

          <p className="text-dark/40 text-sm max-w-lg mx-auto leading-relaxed">
            We've sent a confirmation email with all the details. Our atelier will begin preparing your extraction shortly.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
            <Link 
              to="/" 
              className="w-full md:w-auto px-12 py-5 bg-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-gold transition-colors flex items-center justify-center gap-3 group shadow-xl"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link 
              to="/#collections" 
              className="w-full md:w-auto px-12 py-5 bg-white text-dark text-[11px] uppercase tracking-[0.3em] font-bold rounded-full border border-dark/10 hover:border-dark transition-colors flex items-center justify-center gap-3 group"
            >
              View Collections
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
