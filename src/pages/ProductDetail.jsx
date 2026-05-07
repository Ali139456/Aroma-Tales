import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../context/ProductsContext';
import { getEffectivePrices, getTrackedStock, cartUnitsForProduct } from '../lib/productMapper';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  ChevronRight, 
  Share2, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Check, 
  Star, 
  MessageCircle, 
  Minus, 
  Plus,
  Zap,
  Info
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart, cart } = useCart();
  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const raw = Array.isArray(product.images)
      ? product.images.map(String).map((u) => u.trim()).filter(Boolean)
      : [];
    const seen = new Set();
    const deduped = [];
    for (const u of raw) {
      if (seen.has(u)) continue;
      seen.add(u);
      deduped.push(u);
    }
    if (!deduped.length && product.image) deduped.push(product.image);
    return deduped;
  }, [product]);
  const eff = useMemo(() => (product ? getEffectivePrices(product) : null), [product]);
  const tracked = useMemo(() => (product ? getTrackedStock(product) : null), [product]);
  const remaining = useMemo(() => {
    if (!product || tracked === null) return null;
    return Math.max(0, tracked - cartUnitsForProduct(cart, product.id));
  }, [product, tracked, cart]);
  const globallyOut = tracked !== null && tracked === 0;
  const noneLeftForBuyer =
    tracked !== null && tracked > 0 && remaining !== null && remaining < 1;

  const [selectedSize, setSelectedSize] = useState('30ml');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setGalleryIdx(0);
  }, [id]);

  useEffect(() => {
    if (tracked === null) {
      setQuantity((q) => Math.min(99, Math.max(1, q)));
      return;
    }
    if (tracked === 0) return;
    const cap = Math.min(99, remaining ?? 0);
    if (cap < 1) {
      setQuantity(1);
      return;
    }
    setQuantity((q) => Math.min(Math.max(1, q), cap));
  }, [tracked, remaining]);

  const handleAddToCart = () => {
    if (!product || globallyOut || noneLeftForBuyer) return;
    const n =
      tracked === null ? quantity : Math.min(quantity, Math.max(0, remaining ?? 0));
    if (n < 1) return;
    for (let i = 0; i < n; i++) {
      addToCart(product, selectedSize);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi Aroma Tales! I'd like to order ${quantity}x ${product.name} (${selectedSize}).`;
    window.open(`https://wa.me/1234567890?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return <div className="page-product pt-32 sm:pt-36 md:pt-40 text-center text-dark/45 font-light px-4">Loading fragrance…</div>;
  }

  if (!product) return <div className="page-product pt-32 sm:pt-36 md:pt-40 text-center px-4">Product not found.</div>;

  const unitPrice =
    selectedSize === '30ml' ? eff.price30ml : eff.price;

  return (
    <div className="page-product pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 bg-[#FBFBFB]">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        
        {/* Breadcrumbs - Minimalist */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[8px] sm:text-[9px] uppercase tracking-[0.35em] sm:tracking-[0.4em] text-dark/30 mb-10 sm:mb-14 lg:mb-16 ml-1 max-w-full">
          <Link to="/" className="hover:text-dark transition-colors">Atelier</Link>
          <span className="opacity-30">/</span>
          <span className="text-dark/60">{product.category}</span>
          <span className="opacity-30">/</span>
          <span className="text-dark font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24">
          
          {/* Left Column - Editorial Gallery */}
          <div className="lg:col-span-7">
            <div className="relative lg:sticky lg:top-32 xl:top-40 space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden group shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)]"
              >
                <img 
                  src={galleryImages[galleryIdx] || product.image} 
                  alt={product.name} 
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                />
                
                {/* Visual Badges */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-col gap-2 sm:gap-3 max-w-[calc(100%-5rem)]">
                  {product.isBestSeller && (
                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-dark text-white text-[8px] sm:text-[9px] uppercase tracking-[0.3em] font-bold rounded-full flex items-center gap-2 shadow-xl">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      Bestseller
                    </div>
                  )}
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-md text-dark text-[8px] sm:text-[9px] uppercase tracking-[0.3em] font-bold rounded-full flex items-center gap-2 shadow-sm border border-dark/5">
                    <Zap className="w-3 h-3 text-gold" />
                    Hot Item
                  </div>
                </div>

                {/* Floating Actions */}
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex flex-col gap-3 sm:gap-4">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-dark/5 flex items-center justify-center backdrop-blur-xl transition-all duration-500 shadow-xl ${isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/80 text-dark hover:bg-white'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                  </button>
                  <button type="button" className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-dark/5 flex items-center justify-center bg-white/80 backdrop-blur-xl hover:bg-white transition-all duration-500 text-dark shadow-xl">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {galleryImages.length > 1 && (
                <div className="flex flex-wrap gap-3">
                  {galleryImages.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setGalleryIdx(i)}
                      className={`relative w-[4.5rem] h-[4.5rem] sm:w-[5.25rem] sm:h-[5.25rem] rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                        galleryIdx === i
                          ? 'border-gold shadow-md ring-2 ring-gold/25'
                          : 'border-dark/10 hover:border-dark/25 opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6 hidden md:grid">
                 <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-dark/5 p-12 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-offwhite flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6 text-dark/30" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Lab Verified Extracts</p>
                 </div>
                 <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-dark/5 p-12 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-offwhite flex items-center justify-center mb-4">
                      <Truck className="w-6 h-6 text-dark/30" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Free Delivery Nationwide</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Meta & CRO */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12"
            >
              {/* Header Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">
                    {product.category} — Extrait De Parfum
                  </span>
                  <div className="h-px flex-grow bg-dark/5"></div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-dark tracking-tight leading-[1.08] sm:leading-tight">{product.name}</h1>
                
                <div className="flex items-center gap-4 flex-wrap">
                  {eff.onSale && (
                    <p className="text-2xl font-light text-dark/35 line-through tracking-tighter tabular-nums">
                      Rs.{selectedSize === '30ml' ? product.price30ml : product.price}
                    </p>
                  )}
                  <p className="text-2xl sm:text-3xl md:text-4xl font-light text-dark/90 tracking-tighter tabular-nums">
                    Rs.{unitPrice} <span className="text-base sm:text-lg text-dark/30 ml-1 sm:ml-2">PKR</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}
                    <span className="text-[10px] uppercase tracking-widest font-bold ml-2 text-dark/40">(128 Reviews)</span>
                  </div>
                </div>
              </div>

              {/* The Story Section */}
              <div className="p-5 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-dark/5 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Info className="w-20 h-20 text-dark" />
                 </div>
                 <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-6">The Story</p>
                 <p className="text-dark/70 text-base sm:text-lg font-light leading-relaxed relative z-10 italic">
                    "{(product.description || '').split('.')[0] || product.name}."
                 </p>
              </div>

              {/* Stock */}
              {tracked === null && (
                <div className="flex items-center gap-3 py-4 px-6 bg-emerald-50/40 rounded-2xl border border-emerald-100/60">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">
                    In stock · Ships quickly
                  </span>
                </div>
              )}
              {globallyOut && (
                <div className="flex items-center gap-3 py-4 px-6 bg-red-50/60 rounded-2xl border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-red-800">
                    Out of stock
                  </span>
                </div>
              )}
              {tracked !== null && tracked > 0 && noneLeftForBuyer && (
                <div className="flex items-center gap-3 py-4 px-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-900">
                    All remaining units are already in your bag
                  </span>
                </div>
              )}
              {tracked !== null &&
                tracked > 0 &&
                !noneLeftForBuyer &&
                remaining !== null &&
                remaining <= (product.lowStockThreshold ?? 5) && (
                  <div className="flex items-center gap-3 py-4 px-6 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-orange-700">
                      Only {remaining} left · Ready to ship
                    </span>
                  </div>
                )}
              {tracked !== null &&
                tracked > 0 &&
                !noneLeftForBuyer &&
                remaining !== null &&
                remaining > (product.lowStockThreshold ?? 5) && (
                  <div className="flex items-center gap-3 py-4 px-6 bg-emerald-50/40 rounded-2xl border border-emerald-100/60">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">
                      {remaining} available · Ready to ship
                    </span>
                  </div>
                )}

              {/* Selectors */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-dark/40">Volume Selection</p>
                    <button className="text-[9px] uppercase tracking-widest text-gold font-bold border-b border-gold/30">Sizing Guide</button>
                  </div>
                  <div className="flex gap-4">
                    {['30ml', '50ml'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 py-5 rounded-2xl border transition-all duration-500 text-xs tracking-[0.2em] uppercase font-bold ${selectedSize === size ? 'bg-dark border-dark text-white shadow-2xl' : 'bg-white border-dark/5 text-dark/40 hover:border-dark/20'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">Quantity</p>
                  <div className="flex items-center gap-6 bg-white p-3 rounded-2xl border border-dark/5 w-fit shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl hover:bg-offwhite transition-colors flex items-center justify-center text-dark/40 hover:text-dark"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-medium w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (tracked === null) {
                          setQuantity((q) => Math.min(99, q + 1));
                          return;
                        }
                        if (tracked === 0) return;
                        const cap = Math.min(99, remaining ?? 0);
                        if (cap < 1) return;
                        setQuantity((q) => Math.min(cap, q + 1));
                      }}
                      disabled={
                        globallyOut ||
                        noneLeftForBuyer ||
                        (tracked !== null &&
                          tracked > 0 &&
                          quantity >= Math.min(99, remaining ?? 0))
                      }
                      className="w-10 h-10 rounded-xl hover:bg-offwhite transition-colors flex items-center justify-center text-dark/40 hover:text-dark disabled:opacity-25 disabled:pointer-events-none"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Buying Actions */}
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={globallyOut || noneLeftForBuyer}
                  className="group relative w-full py-5 sm:py-7 bg-dark overflow-hidden transition-all duration-700 rounded-full shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-35 disabled:pointer-events-none disabled:hover:scale-100 min-h-[52px]"
                >
                  <div className={`absolute inset-0 bg-gold transition-transform duration-700 ease-out ${isAdded ? 'translate-y-0' : 'translate-y-[101%]'} group-hover:translate-y-0`}></div>
                  <div className="relative z-10 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.5em] font-bold text-white group-hover:text-dark transition-colors duration-500">
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Bag
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Add to Bag — Rs.{unitPrice * quantity}
                      </>
                    )}
                  </div>
                </button>
                
                <button 
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-3 sm:gap-4 py-5 sm:py-7 bg-white border border-dark/10 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[0.35em] sm:tracking-[0.5em] font-bold text-dark hover:border-dark transition-all duration-500 shadow-sm min-h-[52px]"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  Order on WhatsApp
                </button>
              </div>

              {/* Trust & Perks Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-8 py-8 sm:py-10 border-y border-dark/5">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gold/5 flex items-center justify-center">
                     <Truck className="w-4 h-4 text-gold" />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-widest font-bold">Free Delivery</p>
                     <p className="text-[9px] text-dark/40 mt-0.5">Express shipping included</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gold/5 flex items-center justify-center">
                     <ShieldCheck className="w-4 h-4 text-gold" />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-widest font-bold">100% Original</p>
                     <p className="text-[9px] text-dark/40 mt-0.5">Authenticity guaranteed</p>
                   </div>
                </div>
              </div>

              {/* Fragrance Architecture Tabs */}
              <div className="pt-8">
                 <div className="pdp-mobile-tab-row flex gap-6 sm:gap-10 border-b border-dark/5 mb-8 sm:mb-10 overflow-x-auto">
                    {[
                      { id: 'notes', label: 'Notes' },
                      { id: 'performance', label: 'Performance' },
                    ].map(({ id: tabId, label }) => (
                      <button 
                        key={tabId}
                        type="button"
                        onClick={() => setActiveTab(tabId)}
                        className={`pb-4 shrink-0 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold transition-all relative whitespace-nowrap ${activeTab === tabId ? 'text-dark' : 'text-dark/30 hover:text-dark/50'}`}
                      >
                        {label}
                        {activeTab === tabId && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />}
                      </button>
                    ))}
                 </div>

                 <AnimatePresence mode="wait">
                    {activeTab === 'notes' && (
                      <motion.div 
                        key="notes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                            <div className="space-y-3">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-gold">Top Notes</p>
                               <div className="flex flex-wrap gap-2">
                                  {(product.notes.top || '').split(',').map((n) => n.trim()).filter(Boolean).map((n) => (
                                    <span key={n} className="px-3 py-1.5 bg-white border border-dark/5 rounded-lg text-[10px] font-medium text-dark/70">{n}</span>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-gold">Heart Notes</p>
                               <div className="flex flex-wrap gap-2">
                                  {(product.notes.heart || '').split(',').map((n) => n.trim()).filter(Boolean).map((n) => (
                                    <span key={n} className="px-3 py-1.5 bg-white border border-dark/5 rounded-lg text-[10px] font-medium text-dark/70">{n}</span>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-gold">Base Notes</p>
                               <div className="flex flex-wrap gap-2">
                                  {(product.notes.base || '').split(',').map((n) => n.trim()).filter(Boolean).map((n) => (
                                    <span key={n} className="px-3 py-1.5 bg-white border border-dark/5 rounded-lg text-[10px] font-medium text-dark/70">{n}</span>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'performance' && (
                      <motion.div 
                        key="performance"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
                      >
                         <div className="p-6 bg-white rounded-2xl border border-dark/5 text-center">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-dark/40 mb-2">Concentration</p>
                            <p className="text-sm font-medium">{product.specs?.concentration ?? '—'}</p>
                         </div>
                         <div className="p-6 bg-white rounded-2xl border border-dark/5 text-center">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-dark/40 mb-2">Sillage</p>
                            <p className="text-sm font-medium">{product.specs?.sillage ?? '—'}</p>
                         </div>
                         <div className="p-6 bg-white rounded-2xl border border-dark/5 text-center">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-dark/40 mb-2">Longevity</p>
                            <p className="text-sm font-medium">{product.specs?.lasting ?? '—'}</p>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
