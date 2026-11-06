import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FlyAnimationContext = createContext(null);

export function useFlyAnimation() {
  const context = useContext(FlyAnimationContext);
  if (!context) {
    throw new Error('useFlyAnimation must be used within a FlyAnimationProvider');
  }
  return context;
}

export function FlyAnimationProvider({ children }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const [cartBouncing, setCartBouncing] = useState(false);
  const cartBounceTimeoutRef = useRef(null);

  // Trigger bounce effect on the header cart button and badge
  const triggerCartBounce = useCallback(() => {
    setCartBouncing(true);
    if (cartBounceTimeoutRef.current) {
      clearTimeout(cartBounceTimeoutRef.current);
    }

    const cartBtn = document.getElementById('header-cart-btn') || document.getElementById('mobile-cart-btn');
    const badge = document.getElementById('header-cart-badge') || document.getElementById('mobile-cart-badge');

    if (cartBtn) {
      cartBtn.classList.remove('animate-cart-bounce');
      // Trigger reflow to restart animation if clicked repeatedly
      void cartBtn.offsetWidth;
      cartBtn.classList.add('animate-cart-bounce');
    }

    if (badge) {
      badge.classList.remove('animate-badge-pop');
      void badge.offsetWidth;
      badge.classList.add('animate-badge-pop');
    }

    cartBounceTimeoutRef.current = setTimeout(() => {
      setCartBouncing(false);
      if (cartBtn) cartBtn.classList.remove('animate-cart-bounce');
      if (badge) badge.classList.remove('animate-badge-pop');
    }, 700);
  }, []);

  // Trigger arrival effect on any custom target element (e.g. Buy Now, Order Now)
  const triggerTargetArrival = useCallback((targetEl) => {
    if (!targetEl) return;
    targetEl.classList.remove('animate-target-pulse');
    void targetEl.offsetWidth;
    targetEl.classList.add('animate-target-pulse');
    setTimeout(() => {
      targetEl.classList.remove('animate-target-pulse');
    }, 650);
  }, []);

  // Trigger bounce effect on the header wishlist button and badge
  const triggerWishlistBounce = useCallback(() => {
    const wishlistBtn = document.getElementById('header-wishlist-btn') || document.getElementById('mobile-wishlist-btn');
    const badge = document.getElementById('header-wishlist-badge') || document.getElementById('mobile-wishlist-badge');

    if (wishlistBtn) {
      wishlistBtn.classList.remove('animate-cart-bounce');
      void wishlistBtn.offsetWidth;
      wishlistBtn.classList.add('animate-cart-bounce');
    }

    if (badge) {
      badge.classList.remove('animate-badge-pop');
      void badge.offsetWidth;
      badge.classList.add('animate-badge-pop');
    }

    setTimeout(() => {
      if (wishlistBtn) wishlistBtn.classList.remove('animate-cart-bounce');
      if (badge) badge.classList.remove('animate-badge-pop');
    }, 700);
  }, []);

  // Core flight scheduler
  const flyToTarget = useCallback(({
    sourceElement,
    targetElement,
    imageSrc,
    destinationType = 'custom', // 'cart' | 'buy_now' | 'order_now' | 'custom'
    onComplete
  }) => {
    // 1. Accessibility: respect reduced motion preferences
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (destinationType === 'cart') {
        triggerCartBounce();
      } else if (targetElement) {
        triggerTargetArrival(targetElement);
      }
      onComplete?.();
      return;
    }

    // 2. Resolve source element bounds
    if (!sourceElement || typeof sourceElement.getBoundingClientRect !== 'function') {
      console.warn('FlyAnimation: Missing or invalid sourceElement.');
      onComplete?.();
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    if (sourceRect.width === 0 || sourceRect.height === 0) {
      onComplete?.();
      return;
    }

    // 3. Resolve target element bounds
    let resolvedTarget = targetElement;
    if (!resolvedTarget && destinationType === 'cart') {
      resolvedTarget = document.getElementById('header-cart-btn') || document.getElementById('mobile-cart-btn');
    } else if (!resolvedTarget && destinationType === 'wishlist') {
      resolvedTarget = document.getElementById('header-wishlist-btn') || document.getElementById('mobile-wishlist-btn');
    }

    let targetRect;
    if (resolvedTarget && typeof resolvedTarget.getBoundingClientRect === 'function') {
      targetRect = resolvedTarget.getBoundingClientRect();
    } else if (destinationType === 'wishlist') {
      targetRect = { left: (typeof window !== 'undefined' ? window.innerWidth - 80 : 300), top: 20, width: 32, height: 32 };
    } else {
      console.warn('FlyAnimation: Missing or invalid targetElement.');
      onComplete?.();
      return;
    }

    // 4. Calculate coordinates for initial, midpoint arc, and arrival
    const startCenterX = sourceRect.left + sourceRect.width / 2;
    const startCenterY = sourceRect.top + sourceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    const initialWidth = Math.min(sourceRect.width, 160);
    const initialHeight = Math.min(sourceRect.height, 160);
    const targetSize = Math.max(28, Math.min(46, targetRect.width * 0.7));

    // Curved parabolic trajectory points
    const deltaX = targetCenterX - startCenterX;
    const deltaY = targetCenterY - startCenterY;
    const arcHeight = Math.max(75, Math.min(260, Math.abs(deltaX) * 0.28 + Math.abs(deltaY) * 0.2));

    const p1X = (startCenterX + deltaX * 0.28) - (initialWidth * 0.75) / 2;
    const p1Y = Math.max(25, Math.min(startCenterY, targetCenterY) - arcHeight * 0.85) - (initialHeight * 0.75) / 2;

    const p2X = (startCenterX + deltaX * 0.68) - (initialWidth * 0.45) / 2;
    const p2Y = Math.max(15, Math.min(startCenterY, targetCenterY) - arcHeight) - (initialHeight * 0.45) / 2;

    const animationId = `fly-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const newItem = {
      id: animationId,
      imageSrc: imageSrc || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp',
      startX: startCenterX - initialWidth / 2,
      startY: startCenterY - initialHeight / 2,
      startW: initialWidth,
      startH: initialHeight,
      p1X,
      p1Y,
      p1W: initialWidth * 0.75,
      p1H: initialHeight * 0.75,
      p2X,
      p2Y,
      p2W: initialWidth * 0.45,
      p2H: initialHeight * 0.45,
      targetX: targetCenterX - targetSize / 2,
      targetY: targetCenterY - targetSize / 2,
      targetW: targetSize,
      targetH: targetSize,
      duration: 1.15, // Smooth, graceful, trackable flight
      destinationType,
      targetElement: resolvedTarget,
      onComplete,
    };

    setFlyingItems((prev) => [...prev, newItem]);
  }, [triggerCartBounce, triggerTargetArrival]);

  // Convenience helper for Add to Cart
  const flyToCart = useCallback((sourceElement, imageSrc, onComplete) => {
    const targetElement = document.getElementById('header-cart-btn') || document.getElementById('mobile-cart-btn');
    flyToTarget({
      sourceElement,
      targetElement,
      imageSrc,
      destinationType: 'cart',
      onComplete
    });
  }, [flyToTarget]);

  // Convenience helper for Buy Now
  const flyToBuyNow = useCallback((sourceElement, targetButtonElement, imageSrc, onComplete) => {
    flyToTarget({
      sourceElement,
      targetElement: targetButtonElement,
      imageSrc,
      destinationType: 'buy_now',
      onComplete
    });
  }, [flyToTarget]);

  // Convenience helper for Order Now
  const flyToOrderNow = useCallback((sourceElement, targetButtonElement, imageSrc, onComplete) => {
    flyToTarget({
      sourceElement,
      targetElement: targetButtonElement,
      imageSrc,
      destinationType: 'order_now',
      onComplete
    });
  }, [flyToTarget]);

  // Convenience helper for Wishlist / Favorites
  const flyToWishlist = useCallback((sourceElement, imageSrc, onComplete) => {
    flyToTarget({
      sourceElement,
      targetElement: document.getElementById('header-wishlist-btn') || document.getElementById('mobile-wishlist-btn'),
      imageSrc,
      destinationType: 'wishlist',
      onComplete
    });
  }, [flyToTarget]);

  // Cleanup handler when a clone finishes flight
  const handleItemAnimationComplete = useCallback((item) => {
    // 1. Trigger arrival effect on destination
    if (item.destinationType === 'cart') {
      triggerCartBounce();
    } else if (item.destinationType === 'wishlist') {
      triggerWishlistBounce();
    } else if (item.targetElement) {
      triggerTargetArrival(item.targetElement);
    }

    // 2. Invoke callback (e.g. state updates, checkout routing)
    item.onComplete?.();

    // 3. Remove clone from state
    setFlyingItems((prev) => prev.filter((i) => i.id !== item.id));
  }, [triggerCartBounce, triggerWishlistBounce, triggerTargetArrival]);

  return (
    <FlyAnimationContext.Provider
      value={{
        flyToTarget,
        flyToCart,
        flyToBuyNow,
        flyToOrderNow,
        flyToWishlist,
        triggerCartBounce,
        triggerWishlistBounce,
        triggerTargetArrival,
        cartBouncing
      }}
    >
      {children}

      {/* Portal for flying image clones at highest viewport z-index */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
            <AnimatePresence>
              {flyingItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{
                    left: item.startX,
                    top: item.startY,
                    width: item.startW,
                    height: item.startH,
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                  }}
                  animate={{
                    left: [item.startX, item.p1X, item.p2X, item.targetX],
                    top: [item.startY, item.p1Y, item.p2Y, item.targetY],
                    width: [item.startW, item.p1W, item.p2W, item.targetW],
                    height: [item.startH, item.p1H, item.p2H, item.targetH],
                    scale: [1, 0.88, 0.52, 0.18],
                    opacity: [1, 1, 0.9, 0.1],
                    rotate: [0, -8, 6, 0],
                  }}
                  transition={{
                    duration: item.duration || 1.15,
                    ease: [0.22, 0.88, 0.35, 1],
                    times: [0, 0.35, 0.72, 1],
                  }}
                  onAnimationComplete={() => handleItemAnimationComplete(item)}
                  className="fixed rounded-2xl overflow-hidden bg-white shadow-2xl border-2 border-gold-400"
                  style={{
                    willChange: 'transform, left, top, opacity',
                    boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.35), 0 0 20px 2px rgba(212, 175, 55, 0.55)',
                  }}
                >
                  <img
                    src={item.imageSrc}
                    alt="Flying product clone"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </FlyAnimationContext.Provider>
  );
}
