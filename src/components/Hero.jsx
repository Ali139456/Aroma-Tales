import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] w-full flex items-center bg-white overflow-hidden pt-20">
      {/* Background Color Blooms - Animated */}
      <motion.div 
        animate={{ 
          x: [0, 40, 0], 
          y: [0, -30, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-[15%] left-[5%] w-[500px] h-[500px] bg-purple-100/30 blur-[130px] rounded-full pointer-events-none"
      ></motion.div>
      
      <motion.div 
        animate={{ 
          x: [0, -50, 0], 
          y: [0, 40, 0],
          scale: [1, 1.2, 1] 
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-[5%] left-[2%] w-[400px] h-[400px] bg-pink-100/20 blur-[110px] rounded-full pointer-events-none"
      ></motion.div>
      
      <motion.div 
        animate={{ 
          x: [0, 30, 0], 
          y: [0, 50, 0],
          scale: [1, 1.15, 1] 
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-[5%] left-[35%] w-[250px] h-[250px] bg-orange-100/30 blur-[90px] rounded-full pointer-events-none"
      ></motion.div>

      <motion.div 
        animate={{ 
          x: [0, -20, 0], 
          y: [0, -60, 0] 
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-blue-50/10 blur-[120px] rounded-full pointer-events-none"
      ></motion.div>

      {/* Tiny Subtle Gradients */}
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[30%] left-[45%] w-32 h-32 bg-yellow-100/20 blur-[60px] rounded-full pointer-events-none"
      ></motion.div>
      <motion.div 
        animate={{ x: [0, 30, 0], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-[40%] right-[30%] w-40 h-40 bg-teal-50/20 blur-[70px] rounded-full pointer-events-none"
      ></motion.div>
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[10%] right-[20%] w-24 h-24 bg-rose-50/20 blur-[50px] rounded-full pointer-events-none"
      ></motion.div>
      <motion.div 
        animate={{ y: [0, -30, 0], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-[15%] left-[25%] w-36 h-36 bg-indigo-50/10 blur-[65px] rounded-full pointer-events-none"
      ></motion.div>
      
      {/* Top Right Arrow Icon */}
      <div className="absolute top-12 right-12 md:top-20 md:right-20">
        <ArrowUpRight className="w-12 h-12 text-dark" strokeWidth={1.5} />
      </div>

      <div className="container mx-auto px-10 md:px-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[64px] md:text-[80px] font-bold text-dark leading-[1.05] mb-6 font-sans tracking-tight"
          >
            Elevate Your <br /> Scent Game
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-dark/80 text-xl font-normal mb-10"
          >
            Premium fragrances for every personality
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/shop">
              <button className="px-10 py-4 border border-dark rounded-full text-lg font-medium hover:bg-dark hover:text-white transition-all duration-300">
                Shop Now
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Content - Circular Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -15, 0]
            }}
            transition={{ 
              opacity: { duration: 1 },
              scale: { duration: 1 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative w-full max-w-[550px] aspect-square rounded-full border border-dark/10 p-2 overflow-visible"
          >
            {/* Outer ring */}
            <div className="absolute inset-[-10px] rounded-full border border-dark/5 pointer-events-none"></div>
            
            {/* Image Circle */}
            <div className="w-full h-full rounded-full overflow-hidden border border-dark/20 shadow-2xl">
              <img 
                src="/red-sea.jpg" 
                alt="Red Sea Experience" 
                className="w-full h-full object-cover scale-110"
              />
            </div>
            
            {/* Small decorative glow behind circle */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-100/20 blur-[100px] rounded-full"></div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Discover Text (optional, but keep it minimal as requested) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="flex flex-col items-center gap-4 opacity-20">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Discover</span>
          <div className="w-[1px] h-10 bg-dark"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
