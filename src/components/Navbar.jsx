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

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/#collections' },
    { name: 'Contact', path: '/contact' },
    { name: 'Track order', path: '/track' },
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

  const isNavLinkActive = (path) => {
    if (path === '/shop') return location.pathname.startsWith('/shop');
    if (path === '/contact') return location.pathname.startsWith('/contact');
    if (path === '/track') return location.pathname.startsWith('/track');
    if (path === '/#collections') return location.pathname === '/' && location.hash === '#collections';
    return false;
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
        className={`fixed top-10 sm:top-12 left-1/2 -translate-x-1/2 transition-all duration-500 w-[min(100%-0.75rem,92rem)] rounded-full ${
          isMobileMenuOpen ? 'z-[120] overflow-visible' : 'z-[100]'
        } ${
          isScrolled
            ? 'glass-pill py-2.5 px-4 sm:py-3 sm:px-6 md:px-10 lg:px-12'
            : 'bg-white/40 backdrop-blur-sm border border-dark/5 py-3 px-4 sm:py-5 sm:px-6 md:px-10 lg:px-12'
        }`}
      >
      <div className="flex items-center justify-between gap-4 md:gap-6 xl:gap-10">
        {/* Logo */}
        <Link to="/" className="z-50 shrink-0">
          <img src="/logo-black.png" alt="Aroma Tales Logo" className="h-[24px] md:h-[36px] w-auto object-contain" />
        </Link>

        {/* Desktop Links — centered in the bar for a wider, editorial layout */}
        <nav
          className="hidden lg:flex flex-1 min-w-0 justify-center items-center"
          aria-label="Primary"
        >
          <div className="flex items-center gap-6 xl:gap-10 2xl:gap-12">
            {navLinks.map((link) => {
              const active = isNavLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => handleLinkClick(link.path)}
                  className={`nav-pill-link group relative py-2 px-0.5 text-[11px] xl:text-[12px] uppercase tracking-[0.22em] xl:tracking-[0.26em] font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm ${
                    active
                      ? 'text-dark'
                      : 'text-dark/45 hover:text-dark/90 hover:tracking-[0.28em] xl:hover:tracking-[0.32em]'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span
                    className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all duration-300 ${
                      active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    aria-hidden
                  />
                  {!active && (
                    <span className="pointer-events-none absolute -bottom-px left-1/2 h-px w-0 max-w-[2.75rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/70 to-transparent transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Icons & Search */}
        <div className="flex items-center shrink-0 space-x-5 md:space-x-8 xl:space-x-10 z-50">
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-dark/5 rounded-full px-4 xl:px-5 py-2 group focus-within:bg-dark/10 transition-all border border-transparent focus-within:border-dark/10 min-w-0 max-w-[200px] xl:max-w-[280px] 2xl:max-w-[320px]"
          >
            <button type="submit">
              <Search className="w-4 h-4 text-dark/30 group-focus-within:text-dark transition-colors" />
            </button>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrances..." 
              className="bg-transparent border-none outline-none text-[11px] uppercase tracking-widest font-bold ml-3 w-24 sm:w-28 xl:w-36 2xl:w-44 min-w-0 placeholder:text-dark/20 text-dark"
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full z-[119] mt-3 flex w-full flex-col rounded-[2rem] border border-dark/10 bg-white shadow-xl lg:hidden min-h-[calc(100svh-7.25rem)] sm:min-h-[calc(100svh-7.75rem)] overflow-y-auto overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-8 sm:px-8 sm:py-10">
              <div className="flex w-full flex-1 flex-col items-center justify-center gap-5 sm:gap-6">
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
              </div>
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setIsMobileMenuOpen(false);
                }}
                className="mt-10 w-full max-w-[min(100%,320px)] shrink-0 border-t border-dark/10 pt-8 flex flex-row flex-nowrap items-center gap-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances…"
                  className="flex-1 min-w-0 h-11 box-border rounded-full px-4 text-xs font-medium leading-none text-dark placeholder:text-dark/35 outline-none border border-transparent bg-dark/5 focus:border-dark/15"
                  aria-label="Search fragrances"
                />
                <button
                  type="submit"
                  className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-dark text-white inline-flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4 shrink-0" strokeWidth={2} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};

export default Navbar;
