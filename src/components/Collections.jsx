import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolveCollectionBrowseHref } from '../lib/browseProductsLink';

const STATIC_CATEGORIES = [
  { slug: 'mens', name: 'Mens', image: '/black-stone.jpg', filter: '/shop?cat=Mens' },
  { slug: 'womens', name: 'Womens', image: '/white-stone.jpg', filter: '/shop?cat=Womens' },
  { slug: 'unisex', name: 'Unisex', image: '/red-sea.jpg', filter: '/shop?cat=Unisex' },
  {
    slug: 'best-sellers',
    name: 'Best Sellers',
    image: '/infinity.jpg',
    filter: '/shop?cat=BestSellers',
  },
];

const FALLBACK_IMAGE_BY_SLUG = {
  mens: '/black-stone.jpg',
  womens: '/white-stone.jpg',
  unisex: '/red-sea.jpg',
  featured: '/infinity.jpg',
};

const Collections = () => {
  const [categories, setCategories] = useState(STATIC_CATEGORIES);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('collections')
        .select(
          'name, slug, image_url, description, tile_label, browse_products_url, sort_order'
        )
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (cancelled || error || !data?.length) return;
      setCategories(
        data.map((c) => ({
          slug: c.slug,
          name: c.name,
          headline: (c.tile_label && String(c.tile_label).trim()) || c.name,
          description: (c.description && String(c.description).trim()) || '',
          image:
            (typeof c.image_url === 'string' && c.image_url.trim()) ||
            FALLBACK_IMAGE_BY_SLUG[c.slug] ||
            '/red-sea.jpg',
          filter: resolveCollectionBrowseHref(c.browse_products_url, c.name),
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page--collections py-16 sm:py-24 md:py-32 bg-white overflow-hidden" id="collections">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 md:mb-20 gap-8">
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
              className="collections-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-dark leading-tight"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
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
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10">
                    <button
                      type="button"
                      className="w-full py-3.5 sm:py-4 bg-white/90 backdrop-blur-md text-dark text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.4em] font-bold rounded-full opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-10 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-500"
                    >
                      Explore Now
                    </button>
                  </div>
                </div>
              </Link>
              <h3 className="text-2xl font-serif text-dark mb-2 group-hover:text-gold transition-colors">
                {cat.headline || cat.name}
              </h3>
              <p className="text-[11px] md:text-xs text-dark/50 font-light leading-relaxed max-w-[280px] mx-auto line-clamp-3 min-h-[2.75rem]">
                {cat.description?.trim() ? cat.description : 'Discover curated extracts for this line.'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-dark/35 font-bold mt-3">
                Browse products
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
