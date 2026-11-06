import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, fetchWishlist, removeItem, isLoading } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const items = wishlist?.items || [];

  if (!isAuthenticated && items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-cream-100 text-forest-900 flex items-center justify-center mx-auto border border-cream-300">
          <Heart className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-forest-950">My Wishlist</h2>
        <p className="text-xs text-charcoal-600">Please sign in to view and synchronize your saved items across devices.</p>
        <Link to="/login?redirect=/wishlist" className="inline-block px-5 py-2 rounded-full bg-forest-900 text-gold-300 text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-cream-100 text-forest-900 flex items-center justify-center mx-auto border border-cream-300">
          <Heart className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-forest-950">Your Wishlist is Empty</h2>
        <p className="text-xs text-charcoal-600">Explore our premium men's collections and tap the heart icon to save your favorites.</p>
        <Link to="/products" className="inline-block px-5 py-2 rounded-full bg-forest-900 text-gold-300 text-xs font-bold">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Title Header with Instant Back Navigation */}
      <div className="border-b border-cream-300 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">My Wishlist</h1>
            <p className="text-xs text-charcoal-500 mt-0.5">{items.length} saved masterpieces</p>
          </div>
        </div>
        <Link to="/products" className="text-xs font-semibold text-forest-900 hover:text-gold-700">
          Continue Shopping →
        </Link>
      </div>

      {/* List of Wishlist Cards (Pic 6 Composition) */}
      <div className="bg-white rounded-xl border border-cream-300 shadow-xs divide-y divide-cream-100 overflow-hidden">
        {items.map((it) => {
          const product = it.product;
          const primaryImg = product.image_url || product.images?.[0]?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
          const isOutOfStock = product.available_stock <= 0;

          return (
            <div key={it.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Link to={`/products/${product.slug}`} className="w-16 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 flex-shrink-0 border border-cream-200">
                  <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                </Link>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-gold-700 uppercase tracking-wider">{product.brand || 'UNLIMITED choice'}</span>
                  <Link to={`/products/${product.slug}`} className="block">
                    <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 hover:text-forest-800 truncate">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs pt-0.5">
                    <div className="flex text-gold-500">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star key={st} className={`w-3 h-3 ${st <= Math.round(product.rating_average || 5) ? 'fill-gold-500 text-gold-500' : 'text-cream-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-charcoal-500">({product.review_count || 0} reviews)</span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-bold text-forest-950">₹{Math.round(product.price).toLocaleString('en-IN')}</span>
                    {product.compare_at_price && (
                      <span className="text-xs text-charcoal-400 line-through">₹{Math.round(product.compare_at_price).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {((product.selectedColor || it.selected_color || product.color) || (product.selectedSize || it.selected_size || product.size)) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(product.selectedColor || it.selected_color || product.color) && (
                        <span className="text-[9.5px] font-semibold text-forest-900 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          Color: {product.selectedColor || it.selected_color || product.color}
                        </span>
                      )}
                      {(product.selectedSize || it.selected_size || product.size) && (
                        <span className="text-[9.5px] font-semibold text-forest-900 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          Size: {product.selectedSize || it.selected_size || product.size}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Pic 6: Add to Cart, Remove) */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    addItem(product.id, 1, product);
                  }}
                  disabled={isOutOfStock}
                  className="px-4 py-2 rounded-lg bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="px-3 py-2 rounded-lg border border-cream-300 text-charcoal-600 hover:text-red-600 hover:bg-cream-50 text-xs font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
