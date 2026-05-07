import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/#collections' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path) => {
    setIsMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const id = path.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="nav-announce fixed top-0 left-0 w-full bg-dark text-white py-2 sm:py-2.5 overflow-hidden z-[110] border-b border-white/5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-6 sm:gap-10 px-6 sm:px-10">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.3em] font-bold flex items-center gap-2 sm:gap-3">
                <span className="text-gold">✨</span> 100% original extrait de parfum
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.3em] font-bold flex items-center gap-2 sm:gap-3">
                <span className="text-gold">🚚</span> Fast delivery nationwide
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.3em] font-bold flex items-center gap-2 sm:gap-3">
                <span className="text-gold">🔒</span> Secure checkout & EasyPaisa
              </span>
            </div>
          ))}
        </div>
      </div>

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-10 sm:top-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 w-[min(100%-1rem,72rem)] max-w-6xl rounded-full ${
          isScrolled
            ? 'glass-pill py-2.5 px-4 sm:py-3 sm:px-8 md:px-10'
            : 'bg-white/40 backdrop-blur-sm border border-dark/5 py-3 px-4 sm:py-5 sm:px-8 md:px-10'
        }`}
      >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="z-50 shrink-0">
          <img src="/logo-black.png" alt="Aroma Tales Logo" className="h-[24px] md:h-[36px] w-auto object-contain" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => handleLinkClick(link.path)}
              className="text-[13px] uppercase tracking-[0.2em] text-dark/60 hover:text-dark font-medium transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-300 group-hover:w-8"></span>
            </Link>
          ))}
        </div>

        {/* Icons & Search */}
        <div className="flex items-center space-x-6 md:space-x-10 z-50">
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-dark/5 rounded-full px-5 py-2 group focus-within:bg-dark/10 transition-all border border-transparent focus-within:border-dark/10 max-w-[220px] xl:max-w-none"
          >
            <button type="submit">
              <Search className="w-4 h-4 text-dark/30 group-focus-within:text-dark transition-colors" />
            </button>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrances..." 
              className="bg-transparent border-none outline-none text-[11px] uppercase tracking-widest font-bold ml-3 w-28 xl:w-40 min-w-0 placeholder:text-dark/20 text-dark"
            />
          </form>
          
          <Link to="/cart" className="text-dark/70 hover:text-dark transition-colors flex items-center gap-3 group">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {getCartCount()}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-[11px] uppercase tracking-[0.2em] font-bold">Bag</span>
          </Link>

          <Link
            to="/auth"
            aria-label="Account"
            className="text-dark/70 hover:text-dark transition-colors flex items-center justify-center group p-1 -m-1"
          >
            <User className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" strokeWidth={1.5} />
          </Link>
          
          <button 
            type="button"
            className="lg:hidden text-dark p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-full mt-3 sm:mt-4 glass-pill rounded-[2rem] lg:hidden max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain"
          >
            <div className="py-8 px-6 sm:py-10 sm:px-8 flex flex-col space-y-5 sm:space-y-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xl sm:text-2xl font-serif tracking-widest text-dark hover:text-gold transition-colors py-1"
                  onClick={() => handleLinkClick(link.path)}
                >
                  {link.name}
                </Link>
              ))}
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full max-w-[280px] pt-4 mt-2 border-t border-dark/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances…"
                  className="flex-1 min-w-0 bg-dark/5 rounded-full px-4 py-3 text-xs font-medium text-dark placeholder:text-dark/35 outline-none border border-transparent focus:border-dark/15"
                  aria-label="Search fragrances"
                />
                <button
                  type="submit"
                  className="shrink-0 w-11 h-11 rounded-full bg-dark text-white flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" strokeWidth={2} />
                </button>
              </form>
              <Link
                to="/auth"
                aria-label="Account"
                className="text-dark hover:text-gold transition-colors flex items-center justify-center p-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-8 h-8" strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};

export default Navbar;
