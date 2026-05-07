import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Heart, MessageSquare, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-dark/5 pt-32 pb-12 relative overflow-hidden">
      {/* Background Logo Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none z-0 w-full">
        <img 
          src="/logo-black.png" 
          alt="" 
          className="w-full h-auto object-contain grayscale brightness-0" 
        />
      </div>
      <div className="container mx-auto px-10 md:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-10">
            <Link to="/">
              <img src="/logo-black.png" alt="Aroma Tales" className="h-10 w-auto" />
            </Link>
            <p className="text-dark/50 text-lg font-light leading-relaxed max-w-sm">
              An olfactory atelier creating provocative extracts that capture the poetry of nature in hand-poured vessels.
            </p>
            <div className="flex gap-8">
              {[
                { icon: Globe, label: 'Website' },
                { icon: Heart, label: 'Community' },
                { icon: MessageSquare, label: 'Connect' }
              ].map((social) => (
                <a 
                  key={social.label} 
                  href="#" 
                  className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center text-dark/40 hover:bg-dark hover:text-white hover:border-dark transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-dark/30">Archives</p>
              <ul className="space-y-6">
                <li><Link to="/#collections" className="text-sm text-dark/60 hover:text-dark transition-colors">Collections</Link></li>
                <li><Link to="/#collections" className="text-sm text-dark/60 hover:text-dark transition-colors">New Arrivals</Link></li>
                <li><Link to="/#collections" className="text-sm text-dark/60 hover:text-dark transition-colors">Best Sellers</Link></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-dark/30">Maison</p>
              <ul className="space-y-6">
                <li><Link to="/contact" className="text-sm text-dark/60 hover:text-dark transition-colors">Our Story</Link></li>
                <li><Link to="/contact" className="text-sm text-dark/60 hover:text-dark transition-colors">Atelier</Link></li>
                <li><Link to="/contact" className="text-sm text-dark/60 hover:text-dark transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-dark/30">Newsletter</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-transparent border-b border-dark/10 py-3 pr-10 focus:border-dark outline-none text-sm transition-colors"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-dark/30 group-hover:text-dark transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="pt-12 border-t border-dark/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-widest text-dark/30 font-bold">
            &copy; {currentYear} Aroma Tales. All Rights Reserved.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-[10px] uppercase tracking-widest text-dark/30 hover:text-dark transition-colors font-bold">Privacy Policy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-dark/30 hover:text-dark transition-colors font-bold">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
