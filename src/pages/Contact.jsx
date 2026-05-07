import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="pt-40 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-10 md:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl font-serif mb-10 text-dark">Get in Touch</h1>
            <p className="text-dark/60 text-lg font-light max-w-md mb-16 leading-relaxed">
              We'd love to hear from you. Whether you have a question about our collections, our philosophy, or just want to share your thoughts.
            </p>

            <div className="space-y-10">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center group-hover:bg-dark group-hover:text-white transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 mb-1">Email</p>
                  <p className="text-lg text-dark">atelier@aromatales.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center group-hover:bg-dark group-hover:text-white transition-all duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 mb-1">Phone</p>
                  <p className="text-lg text-dark">+1 (234) 567-890</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center group-hover:bg-dark group-hover:text-white transition-all duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 mb-1">Studio</p>
                  <p className="text-lg text-dark">234 Essence Blvd, Grasse, France</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-offwhite p-12 md:p-16 border border-dark/5 shadow-sm rounded-3xl"
          >
            <form className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">First Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light" placeholder="Aroma" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">Last Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light" placeholder="Tales" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">Email Address</label>
                <input type="email" className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light" placeholder="hello@aromatales.com" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">Message</label>
                <textarea rows="4" className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light resize-none" placeholder="How can we help?"></textarea>
              </div>

              <button className="group relative w-full py-6 bg-dark overflow-hidden transition-all duration-500 rounded-full">
                <div className="absolute inset-0 bg-gold translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <div className="relative z-10 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.4em] font-bold text-white group-hover:text-dark transition-colors duration-500">
                  <Send className="w-4 h-4" />
                  Send Message
                </div>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
