import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="pt-28 sm:pt-36 pb-16 sm:pb-20 min-h-[70vh] flex flex-col items-center justify-center text-center px-4 sm:px-8">
        <div className="w-24 h-24 bg-offwhite rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-dark/20" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif mb-5 sm:mb-6 px-2">Your bag is empty</h1>
        <p className="text-dark/50 font-light mb-8 sm:mb-10 max-w-md text-sm sm:text-base px-2">
          Discovery awaits. Explore our collections and find the scent that speaks to your soul.
        </p>
        <Link 
          to="/#collections" 
          className="px-10 py-4 bg-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-gold transition-colors shadow-xl"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="page-cart pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-20">
          
          {/* Cart Items */}
          <div className="lg:col-span-8 flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl font-serif">Shopping Bag</h1>
              <span className="text-[11px] uppercase tracking-[0.3em] text-dark/40 font-bold">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className="space-y-10">
              {cart.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${item.id}-${item.size}`} 
                  className="flex flex-col md:flex-row items-center gap-8 md:gap-10 p-6 sm:p-8 bg-offwhite rounded-2xl sm:rounded-3xl border border-dark/5"
                >
                  <div className="w-32 h-40 bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow space-y-2 text-center md:text-left">
                    <h3 className="text-2xl font-serif">{item.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-dark/40 font-bold">{item.category} — {item.size}</p>
                    <p className="text-lg font-light">Rs.{item.price}</p>
                  </div>

                  <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-full border border-dark/5">
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      className="text-dark/40 hover:text-dark transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="text-dark/40 hover:text-dark transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="text-xl font-medium mb-4">Rs.{item.price * item.quantity}</p>
                    <button 
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/#collections" className="inline-flex items-center gap-4 mt-12 text-[11px] uppercase tracking-[0.3em] font-bold text-dark/40 hover:text-dark transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:w-96">
            <div className="cart-summary-panel bg-dark text-white p-8 sm:p-10 lg:p-12 rounded-[2rem] lg:rounded-[2.5rem] lg:sticky lg:top-28 xl:top-32 shadow-2xl w-full">
              <h2 className="text-2xl sm:text-3xl font-serif mb-8 sm:mb-10">Summary</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-white/60 font-light">
                  <span>Subtotal</span>
                  <span>Rs.{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-white/60 font-light">
                  <span>Shipping</span>
                  <span className="text-gold uppercase text-[10px] tracking-widest font-bold">Free</span>
                </div>
                <div className="w-full h-px bg-white/10 my-6"></div>
                <div className="flex justify-between text-xl font-medium">
                  <span>Total</span>
                  <span>Rs.{getCartTotal()}</span>
                </div>
              </div>

              <Link 
                to="/checkout" 
                className="group relative w-full py-6 bg-white text-dark overflow-hidden transition-all duration-500 rounded-full flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-gold -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 text-[11px] uppercase tracking-[0.4em] font-bold group-hover:text-white transition-colors duration-500">
                  Checkout
                </span>
              </Link>
              
              <p className="text-[10px] text-white/30 text-center mt-8 uppercase tracking-widest leading-relaxed">
                Taxes and discounts calculated at checkout.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
