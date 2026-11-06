import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  ShoppingBag, 
  Package,
  ChevronRight,
  Flame,
  Truck,
  RotateCcw,
  Layers,
  Tag
} from 'lucide-react';
import { categoryService, productService } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import HangingRackShowcase from '../components/common/HangingRackShowcase';
import FloatingSneakersShowcase from '../components/common/FloatingSneakersShowcase';
import OutfitStudioSection from '../components/common/OutfitStudioSection';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, feat, deals, news] = await Promise.all([
          categoryService.getAll(true),
          productService.getAll({ page_size: 12 }),
          productService.getAll({ deals_only: true, page_size: 4 }),
          productService.getAll({ new_arrivals_only: true, page_size: 4 }),
        ]);
        setCategories(cats);
        setFeaturedProducts(feat.items);
        setDealProducts(deals.items);
        setNewArrivals(news.items);
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-10 md:space-y-12 pb-16 bg-white overflow-x-hidden">
      {/* 1. "ON THE RAIL" ANIMATED HANGING-CLOTHES HERO SHOWCASE & 3D STUDIO */}
      <HangingRackShowcase />

      {/* 2. INTERACTIVE FLOATING SNEAKERS SHOWCASE (Matching Pic 2 Half-Moon Arc) */}
      <FloatingSneakersShowcase />

      {/* 2. "SHOP BY CATEGORY" — Single Row Premium Circular Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-4">
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 mb-2">
            <span className="w-8 sm:w-16 h-px bg-gold-500/60"></span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gold-700">Men's Streetwear Editions</span>
            <span className="w-8 sm:w-16 h-px bg-gold-500/60"></span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-950 tracking-tight">
            Shop by Category
          </h2>
        </div>

        <div className="w-full overflow-x-auto pb-4 scrollbar-none">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-w-[760px] md:min-w-0 max-w-7xl mx-auto px-1">
            {[
              { label: 'Hoodies', subtitle: '450GSM Oversized & Zip', slug: 'hoodies', img: 'https://static.joonsite.com/storage/42826/media/2610071101472773.webp' },
              { label: 'T-Shirts', subtitle: 'Drop-Shoulder & Boxy Tees', slug: 't-shirts', img: 'https://static.joonsite.com/storage/42826/media/2610071515314737.webp' },
              { label: 'Shorts', subtitle: 'Cargo & Sweatshorts', slug: 'shorts', img: '/images/categories/shorts.jpg' },
              { label: 'Shoes', subtitle: 'Retro Court & Trainers', slug: 'shoes', img: '/images/categories/shoes.jpg' },
              { label: 'Bottomwear', subtitle: 'Tactical Cargos & Joggers', slug: 'bottomwear', img: '/images/categories/bottomwear.jpg' },
              { label: 'Jackets', subtitle: 'Bombers & Work Chores', slug: 'jackets', img: 'https://static.joonsite.com/storage/42826/media/2610071514560224.webp' },
              { label: 'Accessories', subtitle: 'Dad Caps & Leather Wallets', slug: 'accessories', img: '/images/categories/accessories.jpg' },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={`/category/${item.slug}`}
                className="group flex flex-col items-center text-center w-full"
              >
                <div
                  className="relative w-full aspect-square max-w-[105px] sm:max-w-[120px] md:max-w-[135px] lg:max-w-[155px] xl:max-w-[165px] rounded-full overflow-hidden mb-3 transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-[0_12px_35px_-6px_rgba(22,56,44,0.25)] mx-auto"
                  style={{
                    boxShadow: '0 4px 18px -3px rgba(22, 56, 44, 0.1), inset 0 0 0 2px rgba(197, 168, 128, 0.3)',
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-[2.5px] lg:border-[3px] border-gold-400/50 group-hover:border-gold-500/80 transition-colors duration-500 z-10 pointer-events-none"></div>
                  <img
                    src={item.img}
                    alt={item.label}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                </div>

                <h3 className="font-serif text-xs sm:text-sm lg:text-[15px] font-bold text-charcoal-900 group-hover:text-forest-800 transition-colors duration-300 leading-snug px-0.5">
                  {item.label}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-charcoal-500 group-hover:text-gold-700 font-medium mt-0.5 transition-colors duration-300 tracking-wide line-clamp-1 px-0.5">
                  {item.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-forest-900 hover:text-gold-700 border-b border-forest-900/30 hover:border-gold-700 pb-0.5 transition-all duration-300"
          >
            Explore Complete Men's Catalogue <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. "TRENDING STREETWEAR PRODUCTS" (Dense 4-col grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-700" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-forest-950">Trending Streetwear Pieces</h2>
          </div>
          <Link to="/products" className="text-xs font-semibold text-forest-900 hover:text-gold-700 flex items-center gap-1">
            View All ({featuredProducts.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-xl p-3 border border-gray-100 animate-pulse h-60"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 5. INTERACTIVE MEN'S OUTFIT STUDIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <OutfitStudioSection isStandalonePage={false} />
      </section>
    </div>
  );
}
