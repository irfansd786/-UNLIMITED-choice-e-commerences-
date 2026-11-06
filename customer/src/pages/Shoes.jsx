import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag, 
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Star,
  Check
} from 'lucide-react';
import FloatingSneakersShowcase from '../components/common/FloatingSneakersShowcase';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/api';

export default function Shoes() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    async function fetchShoeCollection() {
      try {
        setLoading(true);
        const data = await productService.getAll({ category_slug: 'shoes', page_size: 20 });
        setProducts(data.items || []);
      } catch (err) {
        console.error('Failed to load shoe collection:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchShoeCollection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredProducts = products.filter(p => {
    if (filterType === 'court') return p.name.toLowerCase().includes('court') || p.name.toLowerCase().includes('retro');
    if (filterType === 'trail') return p.name.toLowerCase().includes('trail') || p.name.toLowerCase().includes('runner');
    if (filterType === 'skate') return p.name.toLowerCase().includes('skate') || p.name.toLowerCase().includes('casual');
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 1. IMMERSIVE HERO: FLOATING SNEAKERS SHOWCASE WITH ADAPTIVE BACKGROUND */}
      <FloatingSneakersShowcase isStandalonePage={true} />

      {/* 2. CURATED FOOTWEAR SPECS & CRAFTSMANSHIP BANNER */}
      <section className="bg-stone-900 text-stone-200 py-12 px-4 sm:px-6 lg:px-8 border-y border-stone-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="border-b md:border-b-0 md:border-r border-stone-800 pb-6 md:pb-0 md:pr-6">
            <p className="text-[#C1A87D] text-xs font-bold uppercase tracking-[0.2em] mb-1">Architecture</p>
            <h3 className="text-white text-lg font-bold font-sans">Anatomical Outsoles</h3>
            <p className="text-xs text-stone-400 mt-1">Multi-density EVA with high-abrasion non-marking rubber tread.</p>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-stone-800 pb-6 md:pb-0 md:pr-6">
            <p className="text-[#C1A87D] text-xs font-bold uppercase tracking-[0.2em] mb-1">Materials</p>
            <h3 className="text-white text-lg font-bold font-sans">Full-Grain Leather</h3>
            <p className="text-xs text-stone-400 mt-1">Hand-selected supple calfskin and reinforced technical ballistic mesh.</p>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-stone-800 pb-6 md:pb-0 md:pr-6">
            <p className="text-[#C1A87D] text-xs font-bold uppercase tracking-[0.2em] mb-1">Cushioning</p>
            <h3 className="text-white text-lg font-bold font-sans">Orbit Cloud Foam</h3>
            <p className="text-xs text-stone-400 mt-1">Responsive micro-cellular polyurethane insoles engineered for all-day rebound.</p>
          </div>
          <div>
            <p className="text-[#C1A87D] text-xs font-bold uppercase tracking-[0.2em] mb-1">Guarantee</p>
            <h3 className="text-white text-lg font-bold font-sans">Verified Authenticity</h3>
            <p className="text-xs text-stone-400 mt-1">100% genuine craftsmanship with instant replacement guarantee.</p>
          </div>
        </div>
      </section>

      {/* 3. FULL SNEAKER COLLECTION CATALOGUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-[0.2em] text-[#8C7A58] uppercase">Unlimited Choice Footwear</span>
              <span className="w-10 h-[1.5px] bg-[#C1A87D]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#16382C] uppercase tracking-tight">
              Complete Men's Footwear Range
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Engineered court sneakers, chunky trail runners, and daily low-profile trainers.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Silhouettes' },
              { id: 'court', label: 'Court & Retro' },
              { id: 'trail', label: 'Trail Runners' },
              { id: 'skate', label: 'Low-Top Skate' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  filterType === f.id
                    ? 'bg-[#16382C] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse bg-stone-100 rounded-2xl h-80" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-2xl">
            <p className="text-stone-500 font-medium">No shoes found matching this filter.</p>
            <button
              onClick={() => setFilterType('all')}
              className="mt-4 px-6 py-2.5 bg-[#16382C] text-white rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>
    </div>
  );
}
