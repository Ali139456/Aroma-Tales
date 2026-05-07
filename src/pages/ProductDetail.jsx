import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
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
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('30ml');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const { addToCart } = useCart();

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    setProduct(foundProduct);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    for(let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi Aroma Tales! I'd like to order ${quantity}x ${product.name} (${selectedSize}).`;
    window.open(`https://wa.me/1234567890?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!product) return <div className="pt-40 text-center">Product not found.</div>;

  return (
    <div className="pt-40 pb-20 bg-[#FBFBFB]">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Breadcrumbs - Minimalist */}
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.4em] text-dark/30 mb-16 ml-1">
          <Link to="/" className="hover:text-dark transition-colors">Atelier</Link>
          <span className="opacity-30">/</span>
          <span className="text-dark/60">{product.category}</span>
          <span className="opacity-30">/</span>
          <span className="text-dark font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column - Editorial Gallery */}
          <div className="lg:col-span-7">
            <div className="sticky top-40 space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden group shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)]"
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                />
                
                {/* Visual Badges */}
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                  {product.isBestSeller && (
                    <div className="px-4 py-2 bg-dark text-white text-[9px] uppercase tracking-[0.3em] font-bold rounded-full flex items-center gap-2 shadow-xl">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      Bestseller
                    </div>
                  )}
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-md text-dark text-[9px] uppercase tracking-[0.3em] font-bold rounded-full flex items-center gap-2 shadow-sm border border-dark/5">
                    <Zap className="w-3 h-3 text-gold" />
                    Hot Item
                  </div>
                </div>

                {/* Floating Actions */}
                <div className="absolute top-8 right-8 flex flex-col gap-4">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-14 h-14 rounded-full border border-dark/5 flex items-center justify-center backdrop-blur-xl transition-all duration-500 shadow-xl ${isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/80 text-dark hover:bg-white'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                  </button>
                  <button className="w-14 h-14 rounded-full border border-dark/5 flex items-center justify-center bg-white/80 backdrop-blur-xl hover:bg-white transition-all duration-500 text-dark shadow-xl">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
              
              {/* Secondary Detail Image (Optional Mock) */}
              <div className="grid grid-cols-2 gap-6 hidden md:grid">
                 <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-dark/5">
                    <img src={product.image} className="w-full h-full object-cover grayscale opacity-50" />
                 </div>
                 <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-dark/5 p-12 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-offwhite flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6 text-dark/30" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Lab Verified Extracts</p>
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
                
                <h1 className="text-7xl font-serif text-dark tracking-tight leading-tight">{product.name}</h1>
                
                <div className="flex items-center gap-8">
                  <p className="text-4xl font-light text-dark/90 tracking-tighter">Rs.{selectedSize === '30ml' ? product.price30ml : product.price} <span className="text-lg text-dark/30 ml-2">PKR</span></p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}
                    <span className="text-[10px] uppercase tracking-widest font-bold ml-2 text-dark/40">(128 Reviews)</span>
                  </div>
                </div>
              </div>

              {/* The Story Section */}
              <div className="p-8 bg-white rounded-3xl border border-dark/5 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Info className="w-20 h-20 text-dark" />
                 </div>
                 <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-6">The Story</p>
                 <p className="text-dark/70 text-lg font-light leading-relaxed relative z-10 italic">
                    "{product.description.split('.')[0]}."
                 </p>
              </div>

              {/* Urgency & Stock */}
              <div className="flex items-center gap-3 py-4 px-6 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                 <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] uppercase tracking-widest font-bold text-orange-700">30 in stock - Ready to ship</span>
              </div>

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
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl hover:bg-offwhite transition-colors flex items-center justify-center text-dark/40 hover:text-dark"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-medium w-6 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl hover:bg-offwhite transition-colors flex items-center justify-center text-dark/40 hover:text-dark"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Buying Actions */}
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="group relative w-full py-7 bg-dark overflow-hidden transition-all duration-700 rounded-full shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
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
                        Add to Bag — Rs.{(selectedSize === '30ml' ? product.price30ml : product.price) * quantity}
                      </>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-4 py-7 bg-white border border-dark/10 rounded-full text-[11px] uppercase tracking-[0.5em] font-bold text-dark hover:border-dark transition-all duration-500 shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  Order on WhatsApp
                </button>
              </div>

              {/* Trust & Perks Grid */}
              <div className="grid grid-cols-2 gap-8 py-10 border-y border-dark/5">
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
                 <div className="flex gap-10 border-b border-dark/5 mb-10">
                    {['notes', 'breakdown', 'performance'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-[11px] uppercase tracking-[0.4em] font-bold transition-all relative ${activeTab === tab ? 'text-dark' : 'text-dark/30 hover:text-dark/50'}`}
                      >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />}
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
                         <div className="grid grid-cols-3 gap-8">
                            <div className="space-y-3">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-gold">Top Notes</p>
                               <div className="flex flex-wrap gap-2">
                                  {product.notes.top.split(',').map(n => <span key={n} className="px-3 py-1.5 bg-white border border-dark/5 rounded-lg text-[10px] font-medium text-dark/70">{n.trim()}</span>)}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-gold">Heart Notes</p>
                               <div className="flex flex-wrap gap-2">
                                  {product.notes.heart.split(',').map(n => <span key={n} className="px-3 py-1.5 bg-white border border-dark/5 rounded-lg text-[10px] font-medium text-dark/70">{n.trim()}</span>)}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-gold">Base Notes</p>
                               <div className="flex flex-wrap gap-2">
                                  {product.notes.base.split(',').map(n => <span key={n} className="px-3 py-1.5 bg-white border border-dark/5 rounded-lg text-[10px] font-medium text-dark/70">{n.trim()}</span>)}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'breakdown' && (
                      <motion.div 
                        key="breakdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                         {product.ingredients?.map((ing) => (
                          <div key={ing.name} className="flex justify-between items-center">
                            <span className="text-sm text-dark/60 font-light">{ing.name}</span>
                            <div className="flex items-center gap-4">
                              <div className="w-32 h-1 bg-dark/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: ing.percentage }}
                                  transition={{ duration: 1 }}
                                  className="h-full bg-gold/60"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-dark w-8 text-right">{ing.percentage}</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'performance' && (
                      <motion.div 
                        key="performance"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-3 gap-8"
                      >
                         <div className="p-6 bg-white rounded-2xl border border-dark/5 text-center">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-dark/40 mb-2">Concentration</p>
                            <p className="text-sm font-medium">{product.specs.concentration}</p>
                         </div>
                         <div className="p-6 bg-white rounded-2xl border border-dark/5 text-center">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-dark/40 mb-2">Sillage</p>
                            <p className="text-sm font-medium">{product.specs.sillage}</p>
                         </div>
                         <div className="p-6 bg-white rounded-2xl border border-dark/5 text-center">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-dark/40 mb-2">Longevity</p>
                            <p className="text-sm font-medium">{product.specs.lasting}</p>
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
