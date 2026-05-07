import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { getEffectivePrices, getTrackedStock, cartUnitsForProduct } from '../lib/productMapper';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  Heart, 
  Plus, 
  ShoppingBag,
  Star,
  Zap,
  ArrowUpRight,
  Check,
} from 'lucide-react';

const Shop = () => {
  const { products, loading: productsLoading } = useProducts();
  const { addToCart, cart } = useCart();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialCat = queryParams.get('cat') || 'All';
  const initialProducts = queryParams.get('products') || '';

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [productsSlugFilter, setProductsSlugFilter] = useState(initialProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  // Effect to update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const cat = params.get('cat');
    const products = params.get('products');
    if (q !== null) setSearchQuery(q);
    if (cat !== null) setActiveCategory(cat);
    if (products !== null) setProductsSlugFilter(products);
  }, [location.search]);

  const productSlugSet = useMemo(() => {
    if (!productsSlugFilter.trim()) return null;
    const set = new Set(
      productsSlugFilter
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return set.size ? set : null;
  }, [productsSlugFilter]);

  const categories = ['All', 'Mens', 'Womens', 'Unisex'];
  const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (productSlugSet && productSlugSet.size > 0) {
      result = result.filter((p) => productSlugSet.has(p.id));
    } else if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort (use effective 50ml price when sale active)
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => getEffectivePrices(a).price - getEffectivePrices(b).price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => getEffectivePrices(b).price - getEffectivePrices(a).price);
    }

    return result;
  }, [products, activeCategory, sortBy, searchQuery, productSlugSet]);

  const handleQuickAdd = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const cap = getTrackedStock(product);
    const used = cartUnitsForProduct(cart, product.id);
    if (cap !== null && used >= cap) return;
    addToCart(product, '30ml');
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="page-shop pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 bg-offwhite min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 sm:mb-16 lg:mb-20 gap-8 lg:gap-10">
          <div className="space-y-4 sm:space-y-6 max-w-2xl w-full">
             <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-dark/30 ml-1">
                <Link to="/" className="hover:text-dark transition-colors">Atelier</Link>
                <span className="opacity-30">/</span>
                <span className="text-dark font-bold">Shop All</span>
             </div>
             <h1 className="shop-page-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-dark tracking-tight">
               The <span className="italic text-copper">Collection</span>
             </h1>
             <p className="text-dark/50 text-base sm:text-lg font-light leading-relaxed">
               Explore our curated selection of provocation extracts. Each scent is a hand-poured story, designed to linger in the memory long after the wearer has left the room.
             </p>
             {productSlugSet && productSlugSet.size > 0 && (
               <p className="text-[11px] uppercase tracking-[0.28em] font-bold text-gold mt-5">
                 Showing {productSlugSet.size} curated {productSlugSet.size === 1 ? 'fragrance' : 'fragrances'} from this collection.
               </p>
             )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto lg:max-w-md lg:justify-end pb-0 lg:pb-2">
             <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 group-focus-within:text-gold transition-colors pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Search olfactory notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-dark/5 rounded-full py-3.5 sm:py-4 pl-11 sm:pl-14 pr-6 text-[11px] uppercase tracking-widest font-bold focus:border-dark/20 outline-none w-full sm:w-64 lg:w-72 shadow-sm transition-all min-h-[48px]"
                />
             </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-12 sm:mb-16 py-6 border-y border-dark/5">
           <div className="shop-categories-row flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible snap-x snap-mandatory sm:snap-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 snap-start px-5 sm:px-8 py-3 min-h-[44px] rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-dark text-white shadow-xl scale-105' : 'bg-white text-dark/40 border border-dark/5 hover:border-dark/20'}`}
                >
                  {cat}
                </button>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full lg:w-auto">
              <label className="lg:hidden w-full max-w-xs">
                <span className="sr-only">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-full border border-dark/15 bg-white py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-dark/70 outline-none focus:border-dark/35 min-h-[48px]"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hidden lg:block relative group">
                 <button type="button" className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-dark/60 hover:text-dark transition-colors">
                    Sort By: <span className="text-dark">{sortBy}</span>
                    <ChevronDown className="w-4 h-4" />
                 </button>
                 <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-dark/5 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {sortOptions.map(opt => (
                      <button 
                        key={opt} 
                        type="button"
                        onClick={() => setSortBy(opt)}
                        className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-dark/40 hover:text-dark hover:bg-offwhite rounded-xl transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-dark/20 whitespace-nowrap">
                {productsLoading ? '…' : filteredProducts.length} Results
              </span>
           </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-14 sm:gap-y-16 lg:gap-y-20">
           <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
                  className="group"
                >
                  <Link to={`/product/${product.id}`} className="block space-y-8">
                     {/* Image Container */}
                     <div className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-700">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                           {product.isBestSeller && (
                             <div className="px-3 py-1.5 bg-dark text-white text-[8px] uppercase tracking-[0.2em] font-bold rounded-full flex items-center gap-2 shadow-xl">
                               <Star className="w-2.5 h-2.5 fill-gold text-gold" />
                               Bestseller
                             </div>
                           )}
                        </div>

                        {/* Wishlist Button */}
                        <button 
                          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-dark/30 hover:text-red-500 hover:bg-white transition-all duration-500 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                           <Heart className="w-4 h-4" />
                        </button>

                        {/* Quick Add Button */}
                        <div className="absolute bottom-6 left-6 right-6">
                           <button
                             type="button"
                             disabled={(() => {
                               const cap = getTrackedStock(product);
                               const used = cartUnitsForProduct(cart, product.id);
                               return cap !== null && (cap === 0 || used >= cap);
                             })()}
                             onClick={(e) => handleQuickAdd(product, e)}
                             className={`w-full py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl disabled:opacity-40 disabled:pointer-events-none disabled:hover:translate-y-0 translate-y-0 opacity-100 sm:translate-y-10 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 ${addedItems[product.id] ? 'bg-gold text-white translate-y-0 opacity-100' : 'bg-dark text-white'}`}
                           >
                              {addedItems[product.id] ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  In Bag
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-4 h-4" />
                                  Add to Bag
                                </>
                              )}
                           </button>
                        </div>
                     </div>

                     {/* Product Info */}
                     <div className="text-center space-y-3">
                        <h3 className="text-2xl font-serif text-dark group-hover:text-gold transition-colors duration-500">{product.name}</h3>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-dark/40 font-bold max-w-[200px] mx-auto line-clamp-1">
                          {product.notes?.top || 'Provocative Extract'}
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                           {(() => {
                             const eff = getEffectivePrices(product);
                             return (
                               <>
                                 {eff.onSale && (
                                   <span className="text-sm text-dark/35 line-through tabular-nums">
                                     Rs.{product.price30ml}
                                   </span>
                                 )}
                                 <span className="text-lg font-medium text-dark/90 tabular-nums">
                                   Rs.{eff.price30ml}
                                 </span>
                               </>
                             );
                           })()}
                        </div>
                     </div>
                  </Link>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-40 text-center space-y-8">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Search className="w-10 h-10 text-dark/10" />
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl font-serif">No matches found</h3>
                <p className="text-dark/40 font-light max-w-md mx-auto">
                  We couldn't find any extractions matching your search. Try adjusting your filters or exploring our bestsellers.
                </p>
             </div>
             <button 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="px-10 py-4 bg-dark text-white text-[11px] uppercase tracking-widest font-bold rounded-full hover:bg-gold transition-colors shadow-xl"
             >
                Reset All Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
