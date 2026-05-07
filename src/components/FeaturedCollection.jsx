import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { getEffectivePrices } from '../lib/productMapper';

const FeaturedCollection = () => {
  const { products } = useProducts();
  return (
    <section className="page--featured py-20 sm:py-28 md:py-36 lg:py-48 bg-white text-dark border-t border-dark/5 relative">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-20">
        <div className="flex flex-col items-center text-center mb-16 sm:mb-24 md:mb-32 space-y-5 sm:space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-6"
          >
            <span className="text-gold uppercase tracking-[0.4em] text-[11px] font-bold">The Boutique</span>
            <div className="w-px h-16 bg-dark/10"></div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="featured-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight px-2"
          >
            Signature <span className="italic">Archives</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-16 sm:gap-y-20 lg:gap-y-24 mb-16 sm:mb-24 md:mb-32">
          {products.map((product, index) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer flex flex-col items-center text-center"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-light mb-10 shadow-sm group-hover:shadow-xl transition-shadow duration-700 rounded-[2rem]">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  />
                  
                  {/* Minimalist Quick Add */}
                  <div className="absolute inset-0 bg-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 translate-y-0 opacity-100 sm:translate-y-6 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-700">
                    <button type="button" className="w-full py-3.5 sm:py-4 bg-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-colors shadow-2xl rounded-xl sm:rounded-2xl">
                      View Details — Rs.{getEffectivePrices(product).price}
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-light tracking-wide group-hover:text-gold transition-colors">{product.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-dark/40 font-medium">{product.notes.top}</p>
                  <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                    {(() => {
                      const eff = getEffectivePrices(product);
                      return (
                        <>
                          {eff.onSale && (
                            <span className="text-[13px] text-dark/35 line-through tabular-nums">
                              Rs.{product.price30ml}
                            </span>
                          )}
                          <span className="text-[14px] font-semibold text-dark/80 tabular-nums">
                            Rs.{eff.price30ml}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Shop All Button */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link 
              to="/shop"
              className="group relative px-12 py-6 bg-dark overflow-hidden transition-all duration-500 rounded-full inline-flex items-center gap-4"
            >
              <div className="absolute inset-0 bg-gold translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative z-10 text-[11px] uppercase tracking-[0.4em] font-bold text-white group-hover:text-dark transition-colors duration-500">
                Explore All Products
              </span>
              <div className="relative z-10 w-8 h-px bg-white group-hover:bg-dark transition-colors duration-500"></div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
