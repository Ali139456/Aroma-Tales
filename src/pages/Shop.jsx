import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  Heart, 
  Plus, 
  ShoppingBag,
  Star,
  Zap,
  ArrowUpRight
} from 'lucide-react';

const Shop = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialCat = queryParams.get('cat') || 'All';

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  // Effect to update state when URL changes
  useEffect(() => {
    const q = queryParams.get('q');
    const cat = queryParams.get('cat');
    if (q !== null) setSearchQuery(q);
    if (cat !== null) setActiveCategory(cat);
  }, [location.search]);

  const categories = ['All', 'Mens', 'Womens', 'Unisex'];
  const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, sortBy, searchQuery]);

  const handleQuickAdd = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, '30ml');
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="pt-40 pb-20 bg-offwhite min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="space-y-6 max-w-2xl">
             <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-dark/30 ml-1">
                <Link to="/" className="hover:text-dark transition-colors">Atelier</Link>
                <span className="opacity-30">/</span>
                <span className="text-dark font-bold">Shop All</span>
             </div>
             <h1 className="text-7xl font-serif text-dark tracking-tight">The <span className="italic text-copper">Collection</span></h1>
             <p className="text-dark/50 text-lg font-light leading-relaxed">
               Explore our curated selection of provocation extracts. Each scent is a hand-poured story, designed to linger in the memory long after the wearer has left the room.
             </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 pb-2">
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search olfactory notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-dark/5 rounded-full py-4 pl-14 pr-8 text-[11px] uppercase tracking-widest font-bold focus:border-dark/20 outline-none w-64 shadow-sm transition-all"
                />
             </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-8 mb-16 py-6 border-y border-dark/5">
           <div className="flex flex-wrap items-center gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-dark text-white shadow-xl scale-105' : 'bg-white text-dark/40 border border-dark/5 hover:border-dark/20'}`}
                >
                  {cat}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-8">
              <div className="relative group">
                 <button className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-dark/60 hover:text-dark transition-colors">
                    Sort By: <span className="text-dark">{sortBy}</span>
                    <ChevronDown className="w-4 h-4" />
                 </button>
                 <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-dark/5 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {sortOptions.map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => setSortBy(opt)}
                        className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-dark/40 hover:text-dark hover:bg-offwhite rounded-xl transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-dark/20">
                {filteredProducts.length} Results
              </span>
           </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
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
                             onClick={(e) => handleQuickAdd(product, e)}
                             className={`w-full py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl ${addedItems[product.id] ? 'bg-gold text-white translate-y-0 opacity-100' : 'bg-dark text-white translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}
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
                        <div className="flex items-center justify-center gap-4 pt-2">
                           <span className="text-lg font-medium text-dark/90">Rs.{product.price30ml}</span>
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
