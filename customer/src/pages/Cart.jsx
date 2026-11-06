import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  X,
  CheckCircle2,
  Heart,
  RefreshCw,
  Lock,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';
import { couponService, productService } from '../services/api';

// Curated backup recommendations if dynamic catalogue query is pending
const CURATED_LOOK_FALLBACK = [
  {
    id: 'rec-1',
    slug: 'wide-leg-vintage-washed-selvedge-denim-jeans',
    name: 'Wide-Leg Selvedge Denim Jeans',
    categoryName: 'Bottomwear',
    color: 'Indigo Stone Wash',
    price: 3299,
    compare_at_price: 4999,
    image_url: '/images/outfits/garments/jeans.png',
    sizes: ['30', '32', '34', '36'],
    defaultSize: '32',
    bgClass: 'from-blue-950 to-slate-900',
  },
  {
    id: 'rec-2',
    slug: 'apex-retro-court-leather-sneakers',
    name: 'Apex Retro Leather Sneakers',
    categoryName: 'Footwear',
    color: 'White / Forest',
    price: 3999,
    compare_at_price: 6499,
    image_url: '/images/sneakers/white-court.png',
    sizes: ['UK 8', 'UK 9', 'UK 10'],
    defaultSize: 'UK 9',
    bgClass: 'from-stone-900 to-neutral-800',
  },
  {
    id: 'rec-3',
    slug: 'tactical-multi-pocket-utility-cargo-pants',
    name: 'Tactical Utility Cargo Pants',
    categoryName: 'Bottomwear',
    color: 'Military Olive',
    price: 2799,
    compare_at_price: 3999,
    image_url: '/images/outfits/garments/cargos.png',
    sizes: ['30', '32', '34', '36'],
    defaultSize: '32',
    bgClass: 'from-amber-950 to-stone-900',
  },
  {
    id: 'rec-4',
    slug: 'minimalist-washed-cotton-dad-cap',
    name: 'Minimalist Washed Cotton Cap',
    categoryName: 'Accessories',
    color: 'Washed Charcoal',
    price: 799,
    compare_at_price: 1299,
    image_url: '/images/outfits/garments/cap.png',
    sizes: ['One Size'],
    defaultSize: 'One Size',
    bgClass: 'from-emerald-950 to-teal-900',
  }
];

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    fetchCart, 
    addItem, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    appliedCoupon, 
    couponDiscount, 
    setAppliedCoupon, 
    removeAppliedCoupon, 
    isLoading 
  } = useCartStore();

  const { isAuthenticated, user } = useAuthStore();
  const { toggleItem } = useWishlistStore();
  const { addToast } = useToastStore();

  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [recommendations, setRecommendations] = useState(CURATED_LOOK_FALLBACK);
  const [addingRecId, setAddingRecId] = useState(null);
  const [quickSizePickerId, setQuickSizePickerId] = useState(null);

  // Synchronize cart on mount & auth change
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Load real catalogue recommendations for "Complete Your Look"
  useEffect(() => {
    async function loadRecommendations() {
      try {
        const res = await productService.getAll({ page_size: 10 });
        const prods = res?.items || (Array.isArray(res) ? res : []);
        if (prods.length > 0) {
          const cartItemIds = (cart?.items || []).map(it => String(it.product_id || it.product?.id));
          const filtered = prods.filter(p => !cartItemIds.includes(String(p.id)));
          if (filtered.length >= 3) {
            setRecommendations(filtered.slice(0, 4));
            return;
          }
        }
      } catch (err) {
        // Fallback to high-quality curated pairs
      }
    }
    loadRecommendations();
  }, [cart?.items?.length]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const isFreeDelivery = subtotal >= 999 || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const totalItemCount = items.reduce((total, it) => total + (Number(it.quantity) || 1), 0);

  // Apply Coupon Code
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await couponService.validate(couponCode.trim(), subtotal);
      if (res.is_valid) {
        setAppliedCoupon({ code: res.code, discount_type: res.discount_type, discount_value: res.discount_value }, res.discount_amount);
        addToast(res.message || `Coupon ${res.code} applied!`, 'success');
        setCouponCode('');
      } else {
        addToast(res.message || 'Invalid promotional code.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to validate coupon code.', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Move Item to Wishlist (Save for Later)
  const handleSaveForLater = async (item) => {
    const product = item.product || {};
    const prodId = item.product_id || product.id;
    try {
      await toggleItem(prodId, {
        ...product,
        selectedSize: item.selected_size || product.selectedSize,
        selectedColor: item.selected_color || product.selectedColor,
        image_url: product.image_url
      });
      await removeItem(item.id);
      addToast(`Moved "${product.name || 'Item'}" to your Wishlist for later.`, 'success');
    } catch (err) {
      addToast('Could not save item for later.', 'error');
    }
  };

  // Quick Add recommendation to Cart
  const handleQuickAddRecommendation = async (rec, chosenSize = null) => {
    const targetSize = chosenSize || rec.defaultSize || rec.sizes?.[0] || 'M';
    setAddingRecId(rec.id);
    try {
      await addItem(rec.id, 1, {
        ...rec,
        selectedSize: targetSize,
        size: targetSize,
        selectedColor: rec.color || rec.selectedColor || 'Standard',
        image_url: rec.image_url || rec.images?.[0]?.image_url
      });
      addToast(`Added "${rec.name}" (${targetSize}) to your shopping bag!`, 'success');
      setQuickSizePickerId(null);
    } catch (err) {
      addToast('Could not add to bag. Please try again.', 'error');
    } finally {
      setAddingRecId(null);
    }
  };

  // Proceed to Checkout navigation
  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // =========================================================================
  // EMPTY CART STATE (Refined Luxury Aesthetic)
  // =========================================================================
  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#F7F7F5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E5DF] p-8 sm:p-10 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#16382C]/5 text-[#16382C] flex items-center justify-center mx-auto border border-[#16382C]/10">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#C5A16E] uppercase">
              UNLIMITED choice
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">
              YOUR SHOPPING BAG IS EMPTY
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Your selected pieces will appear here. Discover our new season streetwear, hoodies, and footwear.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#16382C] hover:bg-[#0F2C22] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow"
            >
              Discover Collections
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login?redirect=/cart"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-gray-50 border border-[#E8E5DF] text-[#1F2937] text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Quick Category Discover Links */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Popular Categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { name: 'Hoodies', slug: 'hoodies' },
                { name: 'T-Shirts', slug: 't-shirts' },
                { name: 'Sneakers', slug: 'sneakers-and-shoes' },
                { name: 'Bottomwear', slug: 'bottomwear' },
                { name: 'Jackets', slug: 'jackets' },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="px-3 py-1.5 rounded-full bg-[#F7F7F5] hover:bg-[#E8E5DF] text-[#1F2937] text-[11px] font-medium transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#252525]">
      {/* =====================================================================
          1. HEADER & SYNCHRONIZATION STATUS BAR (Reference Inspiration)
          ===================================================================== */}
      <div className="bg-white border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
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
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#16382C] transition-colors group"
              >
                <span>Continue Shopping</span>
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A16E]">
                Unlimited Choice Streetwear
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight mt-1">
              Your Shopping Bag <span className="font-sans text-base sm:text-lg font-normal text-gray-500">({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Your selected pieces, ready to make their way to you.
            </p>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-2 self-end sm:self-center bg-[#F7F7F5] px-3 py-1.5 rounded-full border border-[#E8E5DF] text-[11px] text-gray-600">
            <RefreshCw className="w-3 h-3 text-[#16382C]" />
            <span>{isAuthenticated ? 'Cart synced across your devices' : 'Guest session active'}</span>
          </div>
        </div>

        {/* ===================================================================
            2. CHECKOUT PROGRESS INDICATOR (Reference 4-Step Track)
            =================================================================== */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Step 1: CART (Active) */}
            <div className="flex flex-col items-center z-10">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#16382C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                1
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#16382C] mt-1.5">
                Cart
              </span>
            </div>

            {/* Connecting Line 1 to 2 */}
            <div className="flex-1 h-0.5 mx-2 bg-[#E8E5DF] relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[#16382C] w-1/3"></div>
            </div>

            {/* Step 2: SHIPPING */}
            <div className="flex flex-col items-center z-10 opacity-60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8E5DF] text-gray-500 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500 mt-1.5">
                Shipping
              </span>
            </div>

            {/* Connecting Line 2 to 3 */}
            <div className="flex-1 h-0.5 mx-2 bg-[#E8E5DF]"></div>

            {/* Step 3: PAYMENT */}
            <div className="flex flex-col items-center z-10 opacity-60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8E5DF] text-gray-500 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500 mt-1.5">
                Payment
              </span>
            </div>

            {/* Connecting Line 3 to 4 */}
            <div className="flex-1 h-0.5 mx-2 bg-[#E8E5DF]"></div>

            {/* Step 4: REVIEW */}
            <div className="flex flex-col items-center z-10 opacity-60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8E5DF] text-gray-500 flex items-center justify-center text-xs font-medium">
                4
              </div>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500 mt-1.5">
                Review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. MAIN TWO-COLUMN LAYOUT (Desktop ~65% / 35%)
          ===================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =================================================================
              LEFT COLUMN: CART ITEMS + COMPLETE YOUR LOOK
              ================================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* Free Delivery Progress Banner */}
            <div className="bg-white p-4 rounded-xl border border-[#E8E5DF] shadow-xs">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#16382C]/10 text-[#16382C] flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    {isFreeDelivery ? (
                      <p className="font-semibold text-[#16382C]">
                        🎉 You're eligible for <span className="font-bold">FREE Express Delivery</span> across India!
                      </p>
                    ) : (
                      <p className="text-gray-700">
                        Add <span className="font-bold text-[#16382C]">₹{Math.round(999 - subtotal)}</span> more to unlock <span className="font-bold text-[#16382C]">FREE Express Delivery</span>.
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-500 flex-shrink-0">
                  {isFreeDelivery ? '100%' : `${Math.round((subtotal / 999) * 100)}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#F7F7F5] h-1.5 rounded-full overflow-hidden mt-3 border border-gray-100">
                <div
                  className="bg-[#16382C] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                />
              </div>
            </div>

            {/* Product Item Cards List */}
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => {
                  const product = item.product || {};
                  const primaryImg = product.image_url || product.images?.[0]?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
                  const itemTotal = (item.item_total !== undefined && !isNaN(item.item_total))
                    ? item.item_total
                    : ((Number(product.price) || 0) * (Number(item.quantity) || 1));
                  const selectedSize = product.selectedSize || item.selected_size || product.size;
                  const selectedColor = product.selectedColor || item.selected_color || product.color;
                  const isLowStock = product.available_stock && product.available_stock <= 5;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl border border-[#E8E5DF] p-4 sm:p-5 shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* Image & Main Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {/* Generous Product Image Container */}
                          <Link
                            to={product.slug ? `/products/${product.slug}` : '/products'}
                            className="w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-[#F7F7F5] flex-shrink-0 border border-[#E8E5DF] hover:opacity-90 transition-opacity relative group"
                          >
                            <img
                              src={primaryImg}
                              alt={product.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </Link>

                          {/* Details */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-[#C5A16E] uppercase tracking-wider block">
                              {product.brand || 'UNLIMITED CHOICE'}
                            </span>

                            <Link
                              to={product.slug ? `/products/${product.slug}` : '/products'}
                              className="block"
                            >
                              <h3 className="text-sm sm:text-base font-semibold text-[#1F2937] hover:text-[#16382C] transition-colors truncate">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Variant Information Pills (Color | Size) */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              {selectedColor && (
                                <span className="text-[11px] font-medium text-gray-700 bg-[#F7F7F5] px-2 py-0.5 rounded-md border border-[#E8E5DF]">
                                  Color: <span className="font-semibold text-[#16382C]">{selectedColor}</span>
                                </span>
                              )}
                              {selectedSize && (
                                <span className="text-[11px] font-medium text-gray-700 bg-[#F7F7F5] px-2 py-0.5 rounded-md border border-[#E8E5DF]">
                                  Size: <span className="font-semibold text-[#16382C]">{selectedSize}</span>
                                </span>
                              )}
                            </div>

                            {/* Stock Status Indicator */}
                            <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                              {isLowStock ? (
                                <span className="text-amber-700 font-medium flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Only {product.available_stock} left in stock
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-medium flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  In Stock (Ready to dispatch)
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="text-sm sm:text-base font-bold text-[#1F2937]">
                                ₹{Math.round(product.price || 0).toLocaleString('en-IN')}
                              </span>
                              {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{Math.round(product.compare_at_price).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls: Stepper, Row Total, Remove & Save for Later */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-3">
                          
                          {/* Minimal Quantity Stepper */}
                          <div className="flex items-center border border-[#E8E5DF] rounded-lg bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#16382C] hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-xs font-bold text-[#1F2937]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (product.available_stock || 25)}
                              aria-label="Increase quantity"
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#16382C] hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line Item Total */}
                          <div className="text-right">
                            <span className="text-sm sm:text-base font-bold text-[#16382C]">
                              ₹{Math.round(itemTotal).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Action Links: Remove & Save for Later */}
                          <div className="flex items-center gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleSaveForLater(item)}
                              className="text-gray-500 hover:text-[#16382C] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Move to Wishlist"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save for Later</span>
                            </button>
                            <span className="text-gray-300">·</span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Remove from bag"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Clear Cart Quick Action */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors"
              >
                Clear Entire Bag
              </button>
            </div>

            {/* =================================================================
                COMPLETE YOUR LOOK (Reference AI Powered / Curated Section)
                ================================================================= */}
            <div className="bg-white rounded-2xl border border-[#E8E5DF] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16382C]/10 text-[#16382C] text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#C5A16E]" />
                      Curated Pairings
                    </span>
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1F2937] tracking-tight mt-1">
                    Complete Your Look
                  </h2>
                  <p className="text-xs text-gray-500">
                    Discover pieces that complement your selected streetwear pieces.
                  </p>
                </div>

                <Link
                  to="/products"
                  className="text-xs font-semibold text-[#16382C] hover:text-[#0F2C22] flex items-center gap-1 transition-colors"
                >
                  <span>Explore all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Recommendations Horizontal Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                {recommendations.slice(0, 3).map((rec) => {
                  const recImg = rec.image_url || rec.images?.[0]?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
                  const isAdding = addingRecId === rec.id;
                  const isPickingSize = quickSizePickerId === rec.id;

                  return (
                    <div
                      key={rec.id}
                      className="group bg-[#F7F7F5] rounded-xl p-3 border border-[#E8E5DF] hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                      {/* Image Frame */}
                      <Link
                        to={rec.slug ? `/products/${rec.slug}` : '/products'}
                        className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-white mb-2.5 flex items-center justify-center p-2 relative"
                      >
                        <img
                          src={recImg}
                          alt={rec.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Rec Info */}
                      <div className="space-y-1">
                        <Link
                          to={rec.slug ? `/products/${rec.slug}` : '/products'}
                          className="block text-xs font-bold text-[#1F2937] hover:text-[#16382C] truncate"
                        >
                          {rec.name}
                        </Link>
                        <p className="text-[11px] text-gray-500 truncate">
                          {rec.color || rec.categoryName || 'Unlimited Choice Collection'}
                        </p>
                      </div>

                      {/* Price & Add Action */}
                      <div className="pt-3 mt-auto flex items-center justify-between gap-2 border-t border-gray-200/60">
                        <span className="text-xs font-bold text-[#16382C]">
                          ₹{Math.round(rec.price || 0).toLocaleString('en-IN')}
                        </span>

                        {/* Inline size selector toggle or direct quick add */}
                        {isPickingSize ? (
                          <div className="flex items-center gap-1">
                            {(rec.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleQuickAddRecommendation(rec, sz)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-[#16382C] text-[#16382C] hover:bg-[#16382C] hover:text-white transition-colors"
                              >
                                {sz}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setQuickSizePickerId(null)}
                              className="text-gray-400 hover:text-gray-600 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (rec.sizes && rec.sizes.length > 1) {
                                setQuickSizePickerId(rec.id);
                              } else {
                                handleQuickAddRecommendation(rec);
                              }
                            }}
                            disabled={isAdding}
                            className="px-3 py-1.5 rounded-lg bg-[#16382C] hover:bg-[#0F2C22] text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isAdding ? 'Adding...' : '+ Add'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* =================================================================
              RIGHT COLUMN: STICKY ORDER SUMMARY PANEL (Reference Design)
              ================================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#1F2937] pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              {/* Calculation Line Items */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-[#1F2937]">
                    ₹{Math.round(subtotal).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#16382C]">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                    <span className="font-medium">Coupon Savings</span>
                    <span className="font-bold">- ₹{Math.round(couponDiscount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Applicable GST & Taxes</span>
                  <span className="font-medium text-gray-700">Included in price</span>
                </div>

                {/* Final Total */}
                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#1F2937] uppercase tracking-wider block">
                      Total
                    </span>
                    <span className="text-[10px] text-gray-400">All taxes included</span>
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#16382C]">
                    ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout CTA Buttons */}
              <div className="pt-2 space-y-2.5">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#16382C] hover:bg-[#0F2C22] text-[#C5A16E] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A16E]" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#16382C] hover:bg-[#0F2C22] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
                    >
                      <span>Checkout as Guest</span>
                      <ArrowRight className="w-4 h-4 text-[#C5A16E]" />
                    </button>
                    <Link
                      to="/login?redirect=/checkout"
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-[#E8E5DF] text-[#1F2937] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors block text-center"
                    >
                      <span>Login to Continue</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Promo Code Input / Applied Badge */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Have a coupon?
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#16382C] tracking-wider">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[10px] text-emerald-800 font-semibold">
                        Discount applied: ₹{Math.round(couponDiscount)} off
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeAppliedCoupon}
                      className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE (E.G. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#F7F7F5] border border-[#E8E5DF] focus:border-[#16382C] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono uppercase tracking-wider outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-[#16382C] hover:bg-[#0F2C22] text-[#C5A16E] rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
              </div>

              {/* Supported Payment Methods Badges (Reference We Accept) */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  We Accept
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded bg-[#252525] text-white text-[10px] font-bold">
                    UPI
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#1A1F71] text-white text-[10px] font-bold">
                    VISA
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#EB001B] text-white text-[10px] font-bold">
                    MC
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#0070BA] text-white text-[10px] font-bold">
                    RuPay
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#16382C] text-white text-[10px] font-bold">
                    COD
                  </span>
                </div>
              </div>

              {/* Security & Trust Points (Reference Security & Trust) */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] text-gray-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Security & Trust
                </span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Lock className="w-3.5 h-3.5 text-[#16382C] flex-shrink-0" />
                  <span>256-bit SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <RotateCcw className="w-3.5 h-3.5 text-[#16382C] flex-shrink-0" />
                  <span>7-day return & exchange policy</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16382C] flex-shrink-0" />
                  <span>100% authentic Unlimited Choice pieces</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-3.5 h-3.5 text-[#16382C] flex-shrink-0" />
                  <span>Free Express Shipping on orders over ₹999</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E8E5DF] p-3.5 shadow-lg z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total ({totalItemCount} items)
            </span>
            <span className="text-lg font-serif font-bold text-[#16382C]">
              ₹{Math.round(grandTotal).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="flex-1 max-w-[220px] py-3 rounded-full bg-[#16382C] text-[#C5A16E] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
