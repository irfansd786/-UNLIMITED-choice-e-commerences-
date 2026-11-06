import React, { useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Zap } from 'lucide-react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useFlyAnimation } from '../../context/FlyAnimationContext';

/**
 * Derives the authentic size options for a product based on its category or attributes.
 */
export function getProductSizes(product) {
  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }

  const catSlug = (product?.category?.slug || product?.category_slug || product?.category || '').toLowerCase();
  const name = (product?.name || '').toLowerCase();

  // 1. Shoes / Sneakers / Trainers / Footwear
  if (
    catSlug.includes('shoe') ||
    catSlug.includes('footwear') ||
    catSlug.includes('sneaker') ||
    name.includes('shoe') ||
    name.includes('sneaker') ||
    name.includes('trainer') ||
    name.includes('skate')
  ) {
    return ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  }

  // 2. Accessories (Cap, Wallet, Belt, Socks)
  if (
    catSlug.includes('accessori') ||
    name.includes('cap') ||
    name.includes('wallet') ||
    name.includes('belt') ||
    name.includes('socks')
  ) {
    return ['One Size'];
  }

  // 3. Bottomwear / Pants / Jeans / Trousers / Cargos
  if (
    catSlug.includes('bottomwear') ||
    name.includes('jean') ||
    name.includes('pant') ||
    name.includes('denim') ||
    name.includes('cargo') ||
    name.includes('trouser')
  ) {
    return ['30', '32', '34', '36', '38'];
  }

  // 4. Default Apparel (Hoodies, T-Shirts, Shorts, Jackets, Kurtas)
  return ['S', 'M', 'L', 'XL', 'XXL'];
}

export default function ProductCard({ product }) {
  const { isItemInWishlist, toggleItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const { flyToCart, flyToWishlist } = useFlyAnimation();
  const navigate = useNavigate();

  const imgRef = useRef(null);

  // Interaction States
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Pricing & Metadata
  const price = Math.round(product?.price || 0);
  const compareAtPrice = product?.compare_at_price ? Math.round(product.compare_at_price) : 0;
  const hasDiscount = compareAtPrice > price;
  const discountPercent =
    product?.discount_percentage ||
    (hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0);

  const stock =
    product?.available_stock !== undefined
      ? product.available_stock
      : product?.stock !== undefined
      ? product.stock
      : 25;
  const isOutOfStock = stock <= 0;

  const inWishlist = isItemInWishlist(product?.id);
  const categoryName =
    product?.category?.name || product?.category_name || (typeof product?.category === 'string' ? product.category : 'Men\'s Streetwear');

  // Front View Image: Always strictly prioritize front view photography
  const primaryImage = useMemo(() => {
    if (product?.image_url && !product.image_url.includes('_back')) {
      return product.image_url;
    }
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const frontImg = product.images.find(
        (img) => img?.image_url && img.image_url.includes('_front')
      );
      if (frontImg?.image_url) return frontImg.image_url;
      const nonBackImg = product.images.find(
        (img) => img?.image_url && !img.image_url.includes('_back')
      );
      if (nonBackImg?.image_url) return nonBackImg.image_url;
      return product.images[0]?.image_url;
    }
    return (
      product?.image_url ||
      '/images/variants/classic-cream-supima-boxy-tee_original_front.webp'
    );
  }, [product]);

  // Sizes for this specific product
  const sizes = useMemo(() => getProductSizes(product), [product]);

  // Handle Wishlist Toggle with Parabolic Flight to Header Wishlist
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceEl = imgRef.current || e.currentTarget;

    // Trigger smooth parabolic flight towards the Wishlist heart icon in the header
    if (!inWishlist && flyToWishlist && sourceEl) {
      flyToWishlist(sourceEl, primaryImage);
    }

    try {
      const productHint = {
        ...product,
        image_url: primaryImage,
      };
      await toggleItem(product.id, productHint);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  // Handle Size Selection on Hover
  const handleSelectSize = (e, size) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setSelectedSize(size);
    setSizeError(false);
  };

  // Handle Quick Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    // Strict validation: Product cannot be added to cart without selecting a size
    if (!selectedSize) {
      setSizeError(true);
      addToast(`Please select a size for "${product.name}" before adding to bag`, 'warning');
      setTimeout(() => setSizeError(false), 3500);
      return;
    }

    setSizeError(false);
    setIsAdding(true);

    const sourceEl = imgRef.current || e.currentTarget.closest('.group')?.querySelector('img');

    // Smooth cart fly animation
    if (flyToCart && sourceEl) {
      flyToCart(sourceEl, primaryImage, () => {
        setIsAdding(false);
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2000);
      });
    }

    try {
      const productHint = {
        ...product,
        image_url: primaryImage,
        selectedSize: selectedSize,
        available_stock: stock,
      };

      await addItem(product.id, 1, productHint);
      addToast(`Added "${product.name}" (${selectedSize}) to bag!`, 'success');
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error('ProductCard add to cart error:', err);
      addToast('Could not add item to bag. Please try again.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Immediate Order Now (Direct Checkout with Smooth Fly Animation)
  const handleOrderNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // Strict validation: Product cannot go to order/checkout without selecting a size
    if (!selectedSize) {
      setSizeError(true);
      addToast(`Please select a size for "${product.name}" before ordering`, 'warning');
      setTimeout(() => setSizeError(false), 3500);
      return;
    }

    setSizeError(false);
    setIsAdding(true);

    const sourceEl = imgRef.current || e.currentTarget.closest('.group')?.querySelector('img');

    // Trigger Flying Animation to Cart / Checkout
    let hasFlown = false;
    if (flyToCart && sourceEl) {
      hasFlown = true;
      flyToCart(sourceEl, primaryImage, () => {
        navigate('/checkout');
      });
    }

    try {
      const productHint = {
        ...product,
        image_url: primaryImage,
        selectedSize: selectedSize,
        available_stock: stock,
      };
      await addItem(product.id, 1, productHint);

      if (!hasFlown) {
        navigate('/checkout');
      }
    } catch (err) {
      console.error('ProductCard order now error:', err);
      navigate('/checkout');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl border border-neutral-200/80 hover:border-[#16382C]/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden text-left">
      {/* =========================================================================
          TOP: PRODUCT IMAGE CONTAINER (Aspect Ratio 3:4)
          Strictly fixed height & aspect ratio so hover overlays never cause layout shifts!
          ========================================================================= */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F6F2] w-full select-none">
        {/* Clickable Image Links to Product Details */}
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          {/* Front View Product Image (Always stays on front view, never turns backside) */}
          <img
            ref={imgRef}
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top-Left Badges: Discount */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="bg-[#16382C] text-[#C5A16E] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Top-Right: Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center text-charcoal-700 hover:text-red-600 hover:scale-110 shadow-xs transition-all duration-200 z-10 cursor-pointer"
          title={inWishlist ? 'In Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              inWishlist ? 'fill-red-500 text-red-500' : 'text-charcoal-700 hover:text-red-600'
            }`}
          />
        </button>

        {/* =========================================================================
            SLIDE-UP SIZES OVERLAY ON HOVER OR WHEN SIZE REQUIRED
            Visible when cursor hovers on the product card OR when user tries to 
            order/add without picking a size.
            Shows exact sizing:
            - Shoes: UK 7, UK 8, UK 9, UK 10, UK 11
            - Clothes: S, M, L, XL, XXL
            - Bottomwear: 30, 32, 34, 36, 38
            ========================================================================= */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md px-2 py-2.5 border-t shadow-md transition-all duration-300 ease-out z-20 ${
            sizeError
              ? 'translate-y-0 opacity-100 pointer-events-auto border-red-500 ring-2 ring-red-400/40 bg-red-50/90'
              : 'border-neutral-200/80 translate-y-full opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span
              className={`text-[9.5px] font-bold uppercase tracking-wider transition-colors ${
                sizeError ? 'text-red-700 animate-pulse font-extrabold' : 'text-charcoal-700'
              }`}
            >
              {sizeError ? '⚠️ Please Select a Size First' : 'Select Size'}
              {selectedSize && !sizeError && (
                <span className="text-[#16382C] font-extrabold"> · {selectedSize}</span>
              )}
            </span>
            <span className={`text-[8.5px] font-medium ${sizeError ? 'text-red-600 font-bold' : 'text-neutral-400'}`}>
              {sizeError ? 'Choose below' : 'Click to select'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            {sizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => handleSelectSize(e, sz)}
                  disabled={isOutOfStock}
                  className={`min-w-[28px] sm:min-w-[32px] py-1 px-1.5 text-[9.5px] sm:text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'opacity-40 line-through cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200'
                      : isSelected
                      ? 'bg-[#16382C] text-[#C5A16E] border-[#16382C] shadow-xs scale-105 ring-1 ring-[#16382C]/20'
                      : sizeError
                      ? 'bg-white text-red-700 border-red-300 hover:border-[#16382C] hover:text-[#16382C] hover:scale-105'
                      : 'bg-white text-[#252525] border-neutral-200 hover:border-[#16382C] hover:text-[#16382C]'
                  }`}
                  title={isOutOfStock ? `${sz} - Out of stock` : `Select size ${sz}`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM: PRODUCT CONTENT DETAILS
          Permanently visible, clean typography, completely unobstructed by hover
          ========================================================================= */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Clean Category Header */}
          <div className="text-[10px] mb-1">
            <span className="font-bold text-[#C5A16E] uppercase tracking-wider truncate block">
              {categoryName}
            </span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.slug}`} className="block group/title">
            <h3
              className="text-[12px] sm:text-[13px] font-semibold text-[#252525] group-hover/title:text-[#16382C] line-clamp-1 leading-snug transition-colors"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Free Delivery Notice */}
        <div className="pt-2 mt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-[#16382C]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-neutral-400 line-through">
                ₹{compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <span className="text-[9.5px] font-medium text-neutral-400">
            {isOutOfStock ? (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            ) : (
              'Free Delivery'
            )}
          </span>
        </div>

        {/* Permanent Bottom Action Row: Add to Bag & Order Now */}
        <div className="pt-2.5 mt-2 border-t border-neutral-100 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              addedSuccess
                ? 'bg-emerald-700 text-white border-emerald-700'
                : sizeError
                ? 'border-red-400 text-red-700 bg-red-50 hover:bg-red-100 animate-pulse'
                : 'border-neutral-200 hover:border-[#16382C] text-[#16382C] hover:bg-[#16382C]/5'
            }`}
            title={selectedSize ? `Add Size ${selectedSize} to Bag` : 'Select a size first to add to bag'}
          >
            {addedSuccess ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span className="truncate">Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className={`w-3 h-3 ${sizeError ? 'text-red-600' : 'text-[#C5A16E]'}`} />
                <span className="truncate">
                  {isAdding
                    ? 'Adding...'
                    : sizeError
                    ? 'Pick Size'
                    : selectedSize
                    ? `+ Bag (${selectedSize})`
                    : 'Add to Bag'}
                </span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleOrderNow}
            disabled={isOutOfStock}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-xs ${
              sizeError
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-[#16382C] hover:bg-[#0F2C22] text-[#C5A16E] hover:text-white'
            }`}
            title={selectedSize ? `Direct Checkout Size ${selectedSize}` : 'Select a size first to order now'}
          >
            <Zap className="w-3 h-3 text-gold-400" />
            <span className="truncate">
              {sizeError ? 'Pick Size' : selectedSize ? `Order (${selectedSize})` : 'Order Now'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
