import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { categoryService, productService } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ChevronRight, Filter, SlidersHorizontal, X, Star, Search, ArrowLeft } from 'lucide-react';

export default function CategoryProducts() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const sortBy = searchParams.get('sort_by') || 'popularity';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStockOnly = searchParams.get('in_stock_only') === 'true';
  const minRating = searchParams.get('min_rating') || '';
  const minDiscount = searchParams.get('min_discount') || '';

  // Load all categories for filter drawer
  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  // Fetch category & products
  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const [catData, prodData] = await Promise.all([
          categoryService.getBySlug(slug),
          productService.getAll({ 
            category_slug: slug, 
            page: 1, 
            page_size: 100,
            sort_by: sortBy,
            min_price: minPrice ? parseFloat(minPrice) : undefined,
            max_price: maxPrice ? parseFloat(maxPrice) : undefined,
            in_stock_only: inStockOnly || undefined,
            min_rating: minRating ? parseFloat(minRating) : undefined,
            min_discount: minDiscount ? parseFloat(minDiscount) : undefined,
          }),
        ]);
        setCategory(catData);
        setProducts(prodData.items || []);
        setTotal(prodData.total || 0);
      } catch (err) {
        console.error("Failed to load category products", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    minPrice,
    maxPrice,
    inStockOnly,
    minRating,
    minDiscount,
  ].filter(Boolean).length;

  if (!loading && !category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3 font-sans">
        <h2 className="font-serif text-2xl font-bold text-forest-950">Category Not Found</h2>
        <p className="text-xs text-charcoal-600">The requested category does not exist or has been moved.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 rounded-full bg-forest-900 text-gold-300 text-xs font-bold uppercase tracking-wider">
          Browse All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* 1. Breadcrumbs with Instant Back Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-charcoal-500">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer mr-1"
          title="Back to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back</span>
        </button>
        <Link to="/" className="hover:text-forest-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-forest-900">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-forest-950 font-bold uppercase">{category?.name || slug}</span>
      </nav>

      {/* 2. Category Banner Header (Matching Pic 3 clean banner) */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-cream-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
            {category?.name || 'Collection'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            {category?.description || "Heavyweight hoodies, oversized graphic tees, sneakers, and engineered streetwear"}
          </p>
        </div>
      </div>

      {/* 3. Action Bar: Filter Products Button, Piece Count & Sort Dropdown (Matching Pic 3) */}
      <div className="bg-white px-4 sm:px-5 py-3 rounded-xl border border-cream-300 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-charcoal-700">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="font-bold text-forest-900 hover:text-gold-700 flex items-center gap-1.5 underline decoration-gold-400 underline-offset-4 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-forest-900" />
            <span>Filter Products</span>
          </button>
          <span className="text-cream-300">|</span>
          <span className="text-charcoal-600">
            Showing <strong className="text-forest-950">{products.length}</strong> of <strong className="text-forest-950">{total}</strong> pieces
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-charcoal-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort_by', e.target.value)}
            className="bg-cream-50 border border-cream-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-charcoal-900 focus:outline-none focus:border-forest-700 cursor-pointer"
          >
            <option value="popularity">Popularity</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* 4. Active Filter Chips Bar (Shown when any filter is active) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mr-1">Active Filters:</span>

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-800 text-[11px] font-medium">
              Price: {minPrice ? `₹${minPrice}` : '₹0'} - {maxPrice ? `₹${maxPrice}` : 'Above'}
              <button onClick={() => { updateParam('min_price', ''); updateParam('max_price', ''); }} className="hover:text-red-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-800 text-[11px] font-medium">
              In Stock Only
              <button onClick={() => updateParam('in_stock_only', false)} className="hover:text-red-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {minDiscount && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-800 text-[11px] font-medium">
              {minDiscount}% Off or More
              <button onClick={() => updateParam('min_discount', '')} className="hover:text-red-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {minRating && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-charcoal-800 text-[11px] font-medium">
              {minRating}★ & Above
              <button onClick={() => updateParam('min_rating', '')} className="hover:text-red-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-[11px] text-red-600 hover:underline font-semibold ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 5. Full-Width 5-Column Product Grid (Matching Pic 3, Continuous Scroll) */}
      <main className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-cream-200 animate-pulse h-80"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-cream-300 space-y-4 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream-100 text-forest-900 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-950">No Products in this Category</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              No active products currently match these filters in this collection. Try resetting filters or browsing all collections.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-full bg-forest-900 text-gold-300 text-xs font-bold uppercase tracking-wider hover:bg-forest-950 transition-colors shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      {/* 6. SLIDE-OVER FILTER DRAWER ON THE RIGHT SIDE (Matching Pic 4) */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Drawer Body (Right-Side Flyout matching Pic 4) */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
            {/* Drawer Header */}
            <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-forest-900" />
                <h3 className="font-serif text-lg font-bold text-forest-950">
                  Filters & Refinements
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-forest-900 hover:text-gold-700 underline cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-charcoal-500 hover:bg-cream-200 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Controls */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs font-sans">
              
              {/* 1. Collections & Categories (Matching Pic 4) */}
              <div className="space-y-2.5">
                <span className="font-bold text-charcoal-900 uppercase tracking-wide block text-[11px]">
                  Collections & Categories
                </span>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  <Link
                    to="/products"
                    onClick={() => setFilterDrawerOpen(false)}
                    className="w-full text-left py-2 px-3 rounded-lg transition-colors flex items-center justify-between text-charcoal-800 hover:bg-cream-100"
                  >
                    <span>All Collections</span>
                  </Link>
                  {categories.map((cat) => {
                    const isCurrent = cat.slug === slug;
                    return (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setFilterDrawerOpen(false)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                          isCurrent 
                            ? 'bg-forest-900 text-gold-300 font-bold shadow-xs' 
                            : 'text-charcoal-800 hover:bg-cream-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] opacity-75">{cat.product_count}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range (₹) */}
              <div className="space-y-2.5 pt-4 border-t border-cream-200">
                <span className="font-bold text-charcoal-900 uppercase tracking-wide block text-[11px]">
                  Price Range (₹)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-charcoal-500 block mb-1">Minimum (₹)</label>
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => updateParam('min_price', e.target.value)}
                      className="w-full bg-cream-50 border border-cream-300 rounded-lg p-2 text-xs text-charcoal-900 focus:outline-none focus:border-forest-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-charcoal-500 block mb-1">Maximum (₹)</label>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={(e) => updateParam('max_price', e.target.value)}
                      className="w-full bg-cream-50 border border-cream-300 rounded-lg p-2 text-xs text-charcoal-900 focus:outline-none focus:border-forest-700"
                    />
                  </div>
                </div>

                {/* Quick Price Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'Under ₹1,500', max: '1500' },
                    { label: '₹1,500 - ₹3,000', min: '1500', max: '3000' },
                    { label: 'Above ₹3,000', min: '3000' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        if (p.min) newParams.set('min_price', p.min); else newParams.delete('min_price');
                        if (p.max) newParams.set('max_price', p.max); else newParams.delete('max_price');
                        setSearchParams(newParams);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 text-[11px] text-charcoal-800 font-medium transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Availability */}
              <div className="space-y-2 pt-4 border-t border-cream-200">
                <span className="font-bold text-charcoal-900 uppercase tracking-wide block text-[11px]">
                  Inventory Availability
                </span>
                <label className="flex items-center gap-2.5 text-xs text-charcoal-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateParam('in_stock_only', e.target.checked)}
                    className="w-4 h-4 rounded border-cream-300 text-forest-900 focus:ring-forest-800"
                  />
                  <span>In Stock Only (Ready to Ship)</span>
                </label>
              </div>

              {/* 4. Special Discounts */}
              <div className="space-y-2 pt-4 border-t border-cream-200">
                <span className="font-bold text-charcoal-900 uppercase tracking-wide block text-[11px]">
                  Special Discounts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '10% and above', val: '10' },
                    { label: '20% and above', val: '20' },
                    { label: '30% and above', val: '30' },
                    { label: '50% and above', val: '50' },
                  ].map((d) => (
                    <label key={d.val} className="flex items-center gap-2 text-xs text-charcoal-800 cursor-pointer">
                      <input
                        type="radio"
                        name="drawer_discount"
                        checked={minDiscount === d.val}
                        onChange={() => updateParam('min_discount', minDiscount === d.val ? '' : d.val)}
                        onClick={() => minDiscount === d.val && updateParam('min_discount', '')}
                        className="text-forest-900 focus:ring-forest-800"
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Customer Reviews */}
              <div className="space-y-2 pt-4 border-t border-cream-200">
                <span className="font-bold text-charcoal-900 uppercase tracking-wide block text-[11px]">
                  Customer Reviews
                </span>
                <div className="space-y-1.5">
                  {[
                    { stars: 4, label: '4★ & above (Top Rated)' },
                    { stars: 3, label: '3★ & above' },
                  ].map((r) => (
                    <label key={r.stars} className="flex items-center gap-2 text-xs text-charcoal-800 cursor-pointer">
                      <input
                        type="radio"
                        name="drawer_rating"
                        checked={minRating === String(r.stars)}
                        onChange={() => updateParam('min_rating', minRating === String(r.stars) ? '' : String(r.stars))}
                        onClick={() => minRating === String(r.stars) && updateParam('min_rating', '')}
                        className="text-forest-900 focus:ring-forest-800"
                      />
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                        <span>{r.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-cream-200 bg-white flex gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-3 rounded-xl border border-cream-300 text-xs font-semibold text-charcoal-800 hover:bg-cream-100 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                View ({total} Pieces)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
