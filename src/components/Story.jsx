import React from 'react';
import { motion } from 'framer-motion';

const Story = () => {
  return (
    <section id="philosophy" className="py-40 md:py-56 bg-offwhite text-dark overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-dark/5 to-transparent"></div>
      
      <div className="container mx-auto px-10 md:px-20">
        <div className="flex flex-col lg:flex-row items-center gap-24 lg:gap-40">
          
          {/* Image Side - Editorial Layout */}
          <div className="w-full lg:w-1/2 relative h-[550px] md:h-[750px] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full h-full relative z-10 shadow-2xl overflow-hidden"
            >
              <img 
                src="/timeless.jpg" 
                alt="Brand Story" 
                className="w-full h-full object-cover grayscale-[0.05] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-dark/5 mix-blend-overlay"></div>
            </motion.div>
            
            {/* Minimalist Floating Card - Reverted Style */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute -bottom-12 -left-12 bg-white p-12 md:p-16 shadow-[50px_50px_100px_rgba(0,0,0,0.05)] z-20 hidden md:block border border-dark/5"
            >
              <span className="text-[11px] uppercase tracking-[0.5em] text-gold font-bold block mb-4">Established</span>
              <p className="text-3xl font-serif italic text-dark mb-2">2024</p>
              <div className="w-12 h-px bg-dark/10"></div>
            </motion.div>
          </div>

          {/* Text Side - Standard Sizes */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="w-full lg:w-1/2 space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-gold uppercase tracking-[0.4em] text-[11px] font-bold whitespace-nowrap">Our Story</span>
                <div className="w-full h-px bg-dark/5"></div>
              </div>
              <h2 className="text-6xl md:text-7xl font-light leading-[1.1] tracking-tight">
                Rooted in Nature, <br/> <span className="italic text-copper">Refined by Art</span>
              </h2>
            </div>
            
            <div className="space-y-8 text-dark/60 font-light leading-relaxed text-lg md:text-xl max-w-xl">
              <p>
                Aroma Tales was founded on the principle that scent is the most intimate form of storytelling. Our perfumes are more than just fragrances; they are olfactory capsules designed to transport you through time and space.
              </p>
              <p>
                From the selection of rare, ethically sourced botanicals to the hand-poured assembly in our local atelier, every step is an act of devotion. We believe in the luxury of the slow, the authentic, and the invisible.
              </p>
            </div>
            
            <button className="group flex items-center gap-6 text-[12px] uppercase tracking-[0.3em] font-bold pt-6">
              <span className="group-hover:text-gold transition-colors">Discover Our Atelier</span>
              <div className="w-10 h-px bg-dark/20 group-hover:bg-gold group-hover:w-20 transition-all duration-500"></div>
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Story;
