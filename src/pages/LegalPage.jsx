import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BUSINESS_EMAIL } from '../lib/contactInfo';

const privacyBody = (
  <>
    <p className="text-dark/65 font-light leading-relaxed mb-6">
      Aroma Tales respects your privacy. We use your information only to process orders, respond to inquiries, and
      improve our service. We do not sell your personal data.
    </p>
    <p className="text-dark/65 font-light leading-relaxed">
      For privacy-related requests, contact us at{' '}
      <a href={`mailto:${BUSINESS_EMAIL}`} className="font-medium text-dark underline-offset-2 hover:underline">
        {BUSINESS_EMAIL}
      </a>
      .
    </p>
  </>
);

const termsBody = (
  <>
    <p className="text-dark/65 font-light leading-relaxed mb-6">
      By using this website and placing an order, you agree to our prices, shipping terms, and return policies as
      described at checkout and in order confirmations.
    </p>
    <p className="text-dark/65 font-light leading-relaxed">
      For questions about these terms, reach out at{' '}
      <a href={`mailto:${BUSINESS_EMAIL}`} className="font-medium text-dark underline-offset-2 hover:underline">
        {BUSINESS_EMAIL}
      </a>
      .
    </p>
  </>
);

const LegalPage = () => {
  const { pathname } = useLocation();
  const isPrivacy = pathname === '/privacy';

  return (
    <div className="page-legal pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-2xl">
        <Link
          to="/"
          className="inline-block text-[10px] uppercase tracking-[0.28em] font-bold text-dark/40 hover:text-dark transition-colors mb-10"
        >
          ← Back to site
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-8">
            {isPrivacy ? 'Privacy policy' : 'Terms of service'}
          </h1>
          <div className="text-base sm:text-lg">{isPrivacy ? privacyBody : termsBody}</div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;
