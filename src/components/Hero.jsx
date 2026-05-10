import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="page--home relative min-h-[88vh] sm:min-h-[90vh] w-full flex items-center bg-white overflow-hidden pt-32 pb-20 sm:pt-32 sm:pb-16 md:pt-24 md:pb-0">
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
        className="absolute top-[15%] left-[5%] w-[min(92vw,260px)] h-[min(92vw,260px)] sm:w-[380px] sm:h-[380px] md:w-[500px] md:h-[500px] bg-purple-100/30 blur-[130px] rounded-full pointer-events-none"
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
        className="absolute bottom-[5%] left-[2%] w-[min(88vw,220px)] h-[min(88vw,220px)] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] bg-pink-100/20 blur-[110px] rounded-full pointer-events-none"
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
        className="absolute top-[5%] left-[35%] w-[min(70vw,160px)] h-[min(70vw,160px)] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] bg-orange-100/30 blur-[90px] rounded-full pointer-events-none"
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
        className="absolute bottom-[20%] right-[10%] w-[min(85vw,200px)] h-[min(85vw,200px)] sm:w-[280px] sm:h-[280px] md:w-[350px] md:h-[350px] bg-blue-50/10 blur-[120px] rounded-full pointer-events-none"
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
      <div className="hidden sm:block absolute top-12 right-6 md:top-20 md:right-20">
        <ArrowUpRight className="w-8 h-8 sm:w-12 sm:h-12 text-dark" strokeWidth={1.5} />
      </div>

      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        
        {/* Copy — centered on small screens, left-aligned on large */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-bold text-dark leading-[1.05] mb-4 sm:mb-6 font-sans tracking-tight"
          >
            Elevate Your <br /> Scent Game
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-dark/80 text-base sm:text-lg md:text-xl font-normal mb-8 sm:mb-10 max-w-md"
          >
            Premium fragrances for every personality
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-start w-full mt-8 sm:mt-0 mb-14 sm:mb-0"
          >
            <Link to="/shop">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-dark rounded-full text-base sm:text-lg font-medium hover:bg-dark hover:text-white transition-all duration-300 min-h-[48px]">
                Shop Now
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Hero visual — first on mobile; extra top margin below fixed nav + announcement */}
        <div className="w-full lg:w-1/2 flex justify-center items-center relative order-1 lg:order-2 max-w-[min(100%,420px)] lg:max-w-none mx-auto lg:mx-0 mt-14 sm:mt-0">
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
            className="relative w-full max-w-[min(100vw-2rem,550px)] mx-auto lg:mx-0 aspect-square rounded-full border border-dark/10 p-2 overflow-visible"
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

      {/* Decorative Discover Text — inset more on mobile so it clears Shop Now + safe area */}
      <div className="absolute bottom-12 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 sm:gap-4 opacity-25 md:opacity-20">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Discover</span>
        <div className="w-[1px] h-8 sm:h-10 bg-dark"></div>
      </div>
    </section>
  );
};

export default Hero;
