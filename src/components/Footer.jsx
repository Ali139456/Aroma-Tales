import React from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS_EMAIL, BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_E164 } from '../lib/contactInfo';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';

const iconClass = 'w-5 h-5';

function IconInstagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.989 4.435 10.927 10.205 11.827v-8.316H7.078v-3.462h3.127V9.413c0-3.096 1.884-4.812 4.682-4.812 1.337 0 2.736.239 2.736.239v3.005h-1.539c-1.516 0-1.987.941-1.987 1.907v2.289h3.379l-.54 3.462h-2.839v8.316C19.565 23 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconTikTok({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const socialLinks = [
  {
    href: 'https://www.instagram.com/aromatalesofficial/',
    label: 'Aroma Tales on Instagram',
    Icon: IconInstagram,
  },
  {
    href: 'https://www.tiktok.com/@aromatales.official',
    label: 'Aroma Tales on TikTok',
    Icon: IconTikTok,
  },
  {
    href: 'https://www.facebook.com/people/Aroma-Tales/61565297351838/',
    label: 'Aroma Tales on Facebook',
    Icon: IconFacebook,
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="page--footer bg-white border-t border-dark/5 pt-20 sm:pt-28 md:pt-32 pb-10 sm:pb-12 relative overflow-hidden">
      {/* Background Logo Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none z-0 w-full">
        <img 
          src="/logo-black.png" 
          alt="" 
          className="w-full h-auto object-contain grayscale brightness-0" 
        />
      </div>
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 mb-16 sm:mb-24 md:mb-32">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-10">
            <Link to="/">
              <img src="/logo-black.png" alt="Aroma Tales" className="h-10 w-auto" />
            </Link>
            <p className="text-dark/50 text-lg font-light leading-relaxed max-w-sm">
              An olfactory atelier creating provocative extracts that capture the poetry of nature in hand-poured vessels.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center text-dark/40 hover:bg-dark hover:text-white hover:border-dark transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className={iconClass} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation + Contact — 2 columns on mobile, 4 on large screens */}
          <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:gap-10">
            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-dark/30">Archives</p>
              <ul className="space-y-6">
                <li><Link to="/#collections" className="text-sm text-dark/60 hover:text-dark transition-colors">Collections</Link></li>
                <li><Link to="/#collections" className="text-sm text-dark/60 hover:text-dark transition-colors">New Arrivals</Link></li>
                <li><Link to="/#collections" className="text-sm text-dark/60 hover:text-dark transition-colors">Best Sellers</Link></li>
                <li>
                  <Link
                    to="/admin/login"
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Admin login
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-dark/30">Maison</p>
              <ul className="space-y-6">
                <li><Link to="/contact" className="text-sm text-dark/60 hover:text-dark transition-colors">Our Story</Link></li>
                <li><Link to="/contact" className="text-sm text-dark/60 hover:text-dark transition-colors">Atelier</Link></li>
                <li><Link to="/contact" className="text-sm text-dark/60 hover:text-dark transition-colors">Contact</Link></li>
                <li><Link to="/track" className="text-sm text-dark/60 hover:text-dark transition-colors">Track order</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-dark/30">Contact</p>
              <ul className="space-y-5">
                <li>
                  <a
                    href={`tel:${BUSINESS_PHONE_E164.replace(/\s/g, '')}`}
                    className="flex items-start gap-3 text-sm text-dark/65 hover:text-dark transition-colors group"
                  >
                    <Phone className="w-4 h-4 mt-0.5 shrink-0 text-dark/35 group-hover:text-gold transition-colors" strokeWidth={1.5} aria-hidden />
                    <span className="font-medium tracking-wide">{BUSINESS_PHONE_DISPLAY}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${BUSINESS_EMAIL}`}
                    className="flex items-start gap-3 text-sm text-dark/65 hover:text-dark transition-colors group break-all"
                  >
                    <Mail className="w-4 h-4 mt-0.5 shrink-0 text-dark/35 group-hover:text-gold transition-colors" strokeWidth={1.5} aria-hidden />
                    <span>{BUSINESS_EMAIL}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-8 lg:col-span-1">
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
            <Link to="/privacy" className="text-[10px] uppercase tracking-widest text-dark/30 hover:text-dark transition-colors font-bold">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[10px] uppercase tracking-widest text-dark/30 hover:text-dark transition-colors font-bold">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
