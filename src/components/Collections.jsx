import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { ArrowRight } from 'lucide-react';

const Collections = () => {
  const categories = [
    { name: 'Mens', image: '/black-stone.jpg', filter: '/shop?cat=Mens' },
    { name: 'Womens', image: '/white-stone.jpg', filter: '/shop?cat=Womens' },
    { name: 'Unisex', image: '/red-sea.jpg', filter: '/shop?cat=Unisex' },
    { name: 'Best Sellers', image: '/infinity.jpg', filter: '/shop?cat=BestSellers' },
  ];

  return (
    <section className="py-32 bg-white overflow-hidden" id="collections">
      <div className="container mx-auto px-10 md:px-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-8 h-px bg-gold"></div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Curated for You</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl font-serif text-dark leading-tight"
            >
              Explore our <br /> <span className="italic text-copper">Collections</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/contact" className="text-[11px] uppercase tracking-[0.3em] font-bold text-dark hover:text-gold transition-colors flex items-center gap-4 group">
              Speak with a Scent Expert
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group cursor-pointer"
            >
            <Link to={cat.filter} className="block">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 shadow-sm">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-dark/10 group-hover:bg-dark/0 transition-colors duration-500"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <button className="w-full py-4 bg-white/90 backdrop-blur-md text-dark text-[10px] uppercase tracking-[0.4em] font-bold rounded-full opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    Explore Now
                  </button>
                </div>
              </div>
            </Link>
              <h3 className="text-2xl font-serif text-dark mb-2 group-hover:text-gold transition-colors">{cat.name}</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-dark/40 font-bold">Discover the Palette</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
