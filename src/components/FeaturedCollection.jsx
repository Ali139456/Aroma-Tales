import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { products } from '../data/products';

const FeaturedCollection = () => {
  return (
    <section id="collections" className="py-32 md:py-48 bg-white text-dark border-t border-dark/5 relative">
      <div className="container mx-auto px-10 md:px-20">
        <div className="flex flex-col items-center text-center mb-32 space-y-6">
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
            className="text-6xl md:text-7xl font-light tracking-tight"
          >
            Signature <span className="italic">Archives</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24 mb-32">
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
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  />
                  
                  {/* Minimalist Quick Add */}
                  <div className="absolute inset-0 bg-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    <button className="w-full py-4 bg-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-colors shadow-2xl rounded-2xl">
                      View Details — Rs.{product.price * 50}
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-light tracking-wide group-hover:text-gold transition-colors">{product.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-dark/40 font-medium">{product.notes.top}</p>
                  <div className="pt-2">
                    <span className="text-[14px] font-semibold text-dark/80">Rs.{product.price30ml}</span>
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
