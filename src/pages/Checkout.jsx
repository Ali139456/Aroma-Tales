import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronRight, CreditCard, Truck, ShieldCheck, ArrowLeft, Smartphone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateOfflineOrderPlaceholder } from '../lib/orderNumber';
import { getEffectivePrices } from '../lib/productMapper';
import { toastError } from '../lib/appToast';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = getCartTotal();
    const line_items = cart.map((item) => {
      const { price, price30ml } = getEffectivePrices(item);
      const unit = item.size === '30ml' ? price30ml : price;
      return {
        product_slug: item.id,
        product_title: item.name,
        size: item.size,
        quantity: item.quantity,
        unit_price: unit,
        line_total: unit * item.quantity,
        image: item.image || null,
      };
    });

    if (!isSupabaseConfigured || !supabase) {
      clearCart();
      navigate('/order-success', {
        state: {
          orderNumber: generateOfflineOrderPlaceholder(),
          offline: true,
          fromCheckout: true,
        },
      });
      return;
    }

    setSubmitting(true);
    const { data: row, error } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        fulfillment_status: 'unfulfilled',
        delivery_status: 'pending',
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        email: formData.email.trim(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        address_line: formData.address.trim(),
        city: formData.city.trim(),
        postal_code: formData.postalCode.trim(),
        line_items,
        subtotal: total,
        shipping_total: 0,
        total,
        currency: 'PKR',
      })
      .select('id, order_number')
      .single();

    setSubmitting(false);

    if (error) {
      console.error('[checkout]', error);
      toastError(
        'Could not save order',
        `${error.message} Your cart is unchanged — please try again or contact support.`
      );
      return;
    }

    clearCart();
    navigate('/order-success', {
      state: {
        orderNumber: row?.order_number,
        orderId: row?.id,
        fromCheckout: true,
      },
    });
  };

  return (
    <div className="page-checkout pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 bg-offwhite min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-widest text-dark/40 mb-8 sm:mb-12">
          <Link to="/cart" className="hover:text-dark transition-colors">Information</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-dark font-bold">Shipping</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-dark/40">Payment</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Contact Information */}
            <section className="checkout-section-card space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border border-dark/5 shadow-sm">
              <h2 className="text-2xl font-serif">Contact Information</h2>
              <div className="space-y-4">
                <input 
                  required
                  type="email" 
                  name="email"
                  placeholder="Email address" 
                  className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                  onChange={handleInputChange}
                />
              </div>
            </section>

            {/* Shipping Address */}
            <section className="checkout-section-card space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border border-dark/5 shadow-sm">
              <h2 className="text-2xl font-serif">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  required
                  type="text" 
                  name="firstName"
                  placeholder="First name" 
                  className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                  onChange={handleInputChange}
                />
                <input 
                  required
                  type="text" 
                  name="lastName"
                  placeholder="Last name" 
                  className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                  onChange={handleInputChange}
                />
              </div>
              <input 
                required
                type="text" 
                name="address"
                placeholder="Address" 
                className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  required
                  type="text" 
                  name="city"
                  placeholder="City" 
                  className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                  onChange={handleInputChange}
                />
                <input 
                  required
                  type="text" 
                  name="postalCode"
                  placeholder="Postal code" 
                  className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                  onChange={handleInputChange}
                />
              </div>
              <input 
                required
                type="tel" 
                name="phone"
                placeholder="Phone number" 
                className="w-full bg-offwhite border border-dark/5 rounded-xl py-4 px-6 focus:border-dark outline-none text-sm transition-colors"
                onChange={handleInputChange}
              />
            </section>

            {/* Delivery */}
            <section className="checkout-section-card space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border border-dark/5 shadow-sm">
              <h2 className="text-2xl font-serif">Delivery method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'standard', title: 'Standard shipping', sub: 'Free nationwide' },
                  { id: 'express', title: 'Express', sub: 'Faster dispatch' },
                  { id: 'pickup', title: 'Studio pickup', sub: 'Collect in person' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDeliveryMethod(opt.id)}
                    className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                      deliveryMethod === opt.id
                        ? 'border-dark bg-dark/5'
                        : 'border-dark/5 hover:border-dark/20'
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.title}</p>
                    <p className="text-[11px] text-dark/45 mt-2">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="checkout-section-card space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border border-dark/5 shadow-sm">
              <div>
                <h2 className="text-2xl font-serif">Payment Method</h2>
                <p className="text-[10px] uppercase tracking-widest text-dark/40 font-bold mt-2">All transactions are secure and encrypted.</p>
              </div>

              <div className="space-y-4">
                {/* COD */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${paymentMethod === 'cod' ? 'border-dark bg-dark/5' : 'border-dark/5 hover:border-dark/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-dark' : 'border-dark/20'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-dark"></div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-dark/60" />
                      <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                    </div>
                  </div>
                </div>

                {/* Easypaisa / Jazzcash */}
                <div 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`cursor-pointer flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${paymentMethod === 'wallet' ? 'border-dark bg-dark/5' : 'border-dark/5 hover:border-dark/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-dark' : 'border-dark/20'}`}>
                      {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 rounded-full bg-dark"></div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-dark/60" />
                      <span className="text-sm font-medium">Easypaisa / Jazzcash</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'wallet' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-offwhite rounded-2xl text-xs text-dark/60 leading-relaxed border border-dark/5"
                  >
                    Please send the total amount to: <br/>
                    <strong className="text-dark">Easypaisa: 0312-3456789</strong> <br/>
                    <strong className="text-dark">Jazzcash: 0300-1234567</strong> <br/>
                    After payment, please share the screenshot on WhatsApp with your Order ID.
                  </motion.div>
                )}
              </div>
            </section>

            <div className="flex flex-col md:flex-row items-center gap-8 pt-6">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-16 py-6 bg-dark text-white text-[11px] uppercase tracking-[0.4em] font-bold rounded-full hover:bg-gold transition-all duration-500 shadow-xl disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? 'Placing order…' : 'Complete Order'}
              </button>
              <Link to="/cart" className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-dark/40 font-bold hover:text-dark transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Return to cart
              </Link>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="checkout-section-card bg-white p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border border-dark/5 lg:sticky lg:top-28 xl:top-32 shadow-sm">
              <h2 className="text-2xl font-serif mb-10">Order Summary</h2>
              
              <div
                data-lenis-prevent
                className="space-y-8 mb-10 max-h-[400px] overflow-y-auto overscroll-contain touch-pan-y pr-4 custom-scrollbar"
              >
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-6">
                    <div className="relative w-20 h-24 bg-offwhite rounded-xl overflow-hidden shrink-0 border border-dark/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-dark text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      <p className="text-[10px] text-dark/40 uppercase tracking-widest mt-1">{item.size}</p>
                    </div>
                    <span className="text-sm font-medium">Rs.{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-dark/5">
                <div className="flex justify-between text-sm text-dark/60 font-light">
                  <span>Subtotal</span>
                  <span>Rs.{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-sm text-dark/60 font-light">
                  <span>Shipping</span>
                  <span className="text-gold font-bold">Free</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-4 border-t border-dark/5 mt-4">
                  <span>Total</span>
                  <span className="text-2xl font-serif">Rs.{getCartTotal()}</span>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-dark/5 space-y-6">
                <div className="flex items-center gap-4 text-[10px] text-dark/40 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  Secure Checkout
                </div>
                <div className="flex items-center gap-4 text-[10px] text-dark/40 font-bold uppercase tracking-widest">
                  <CreditCard className="w-4 h-4 text-gold" />
                  Satisfaction Guaranteed
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
