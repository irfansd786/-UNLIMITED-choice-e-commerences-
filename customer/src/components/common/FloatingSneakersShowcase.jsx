import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Zap, Check } from 'lucide-react';
import { productService } from '../../services/api';
import { useCartStore } from '../../store/useCartStore';
import { useFlyAnimation } from '../../context/FlyAnimationContext';

// 7 Curated distinct shoe models with 1200x896 ultra HD transparent cutouts
// Verified pixel orientation:
// - panda-dunk: raw image ALREADY faces LEFT -> needsFlip: false
// - white-court: raw image ALREADY faces LEFT -> needsFlip: false
// - retro-red: raw image ALREADY faces LEFT -> needsFlip: false
// - trail-sage: 1200x896 HD raw image ALREADY faces LEFT -> needsFlip: false
// - trainer-cream: 1200x896 HD raw image ALREADY faces LEFT -> needsFlip: false
// - tatum-orbit: raw image faces RIGHT -> needsFlip: true
// - navy-runner: raw image faces RIGHT -> needsFlip: true
const INITIAL_SNEAKERS = [
  {
    id: 53,
    slug: 'tatum-orbit',
    titleLine1: 'TATUM 5',
    titleLine2: 'ORBIT',
    fullName: 'Tatum Orbit',
    price: 7499,
    originalPrice: 9999,
    inrPrice: '₹7,499',
    stock: 24,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/tatum-orbit.png',
    needsFlip: true,
    accentColor: '#16A34A',
    description: 'Engineered with sculptured performance architecture and decoupled foam chassis.'
  },
  {
    id: 30,
    slug: 'apex-retro-court-leather-sneakers',
    titleLine1: 'APEX 5',
    titleLine2: 'RETRO COURT',
    fullName: 'Apex Retro Leather Court Sneakers',
    price: 3999,
    originalPrice: 5999,
    inrPrice: '₹3,999',
    stock: 20,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/white-court.png',
    needsFlip: false,
    accentColor: '#2563EB',
    description: 'Full-grain Italian nappa leather low-profile court sneaker with padded collar.'
  },
  {
    id: 31,
    slug: 'vulcanized-suede-low-top-skate-shoes',
    titleLine1: 'ONYX 5',
    titleLine2: 'PANDA DUNK',
    fullName: 'Vulcanized Low-Top Casual Skate Shoes',
    price: 2699,
    originalPrice: 3999,
    inrPrice: '₹2,699',
    stock: 18,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/panda-dunk.png',
    needsFlip: false,
    accentColor: '#18181B',
    description: 'Two-tone archival skate silhouette with heavy canvas and reinforced suede toe.'
  },
  {
    id: 32,
    slug: 'phantom-stealth-tactical-running-shoes',
    titleLine1: 'NAVY 5',
    titleLine2: 'VELOCITY',
    fullName: 'Phantom Stealth Tactical Sports Trainers',
    price: 3499,
    originalPrice: 4999,
    inrPrice: '₹3,499',
    stock: 22,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/navy-runner.png',
    needsFlip: true,
    accentColor: '#1E3A8A',
    description: 'Jacquard knit aerodynamic road trainers featuring responsive cloud rebound foam.'
  },
  {
    id: 51,
    slug: 'oatmeal-suede-low-top-court-trainer',
    titleLine1: 'RETRO 5',
    titleLine2: 'FLIGHT MID',
    fullName: 'Oatmeal Suede Low-Top Court Trainer',
    price: 3799,
    originalPrice: 5999,
    inrPrice: '₹3,799',
    stock: 22,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/retro-red.png',
    needsFlip: false,
    accentColor: '#DC2626',
    description: 'Heritage high-friction rubber outsole with European split suede and contrast toe bumper.'
  },
  {
    id: 52,
    slug: 'alpine-forest-chunky-trail-runner',
    titleLine1: 'ALPINE 5',
    titleLine2: 'TRAIL RUNNER',
    fullName: 'Alpine Forest Chunky Trail Runner',
    price: 4299,
    originalPrice: 6999,
    inrPrice: '₹4,299',
    stock: 15,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/trail-sage.png',
    needsFlip: false,
    accentColor: '#15803D',
    description: 'Water-resistant Cordura mesh with high-abrasion suede mudguards and lugged grip.'
  },
  {
    id: 54,
    slug: 'zenith-ivory-retro-trainer',
    titleLine1: 'ZENITH 5',
    titleLine2: 'IVORY RETRO',
    fullName: 'Zenith Ivory Retro Trainer',
    price: 4499,
    originalPrice: 6999,
    inrPrice: '₹4,499',
    stock: 20,
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    image: '/images/sneakers/trainer-cream.png',
    needsFlip: false,
    accentColor: '#CA8A04',
    description: 'Cream calfskin leather trainer with perforated toe box and vintage gum cupsole.'
  }
];

/**
 * 7 COMPOSITION SLOTS IN A HALF-MOON ARC
 *
 * Slot 2 is the active hero, extra large (scale 1.36).
 * All sneakers face LEFT (<--) with natural horizontal stance.
 */
const COMPOSITION_SLOTS = [
  // Slot 0: LOWER-LEFT (Entry from far left)
  {
    slotId: 'slot-0',
    x: -310,
    y: 85,
    scale: 0.48,
    rotate: 0,
    opacity: 0.70,
    zIndex: 15,
    isFeatured: false,
    shadowWidth: 150,
    shadowOffset: 14,
    shadowOpacity: 0.14,
    floatDuration: 4.8,
    floatY: 4
  },
  // Slot 1: MID-LEFT
  {
    slotId: 'slot-1',
    x: -185,
    y: 35,
    scale: 0.62,
    rotate: 0,
    opacity: 0.85,
    zIndex: 25,
    isFeatured: false,
    shadowWidth: 190,
    shadowOffset: 18,
    shadowOpacity: 0.17,
    floatDuration: 4.5,
    floatY: 5
  },
  // Slot 2: FEATURED HERO HIGHLIGHT (Main Product - Big & Bold)
  {
    slotId: 'slot-2-featured',
    x: -45,
    y: -35,
    scale: 1.36,
    rotate: 0,
    opacity: 1.0,
    zIndex: 50,
    isFeatured: true,
    shadowWidth: 330,
    shadowOffset: 28,
    shadowOpacity: 0.25,
    floatDuration: 3.8,
    floatY: 7
  },
  // Slot 3: TOP-CENTER (Peak of Half Moon)
  {
    slotId: 'slot-3',
    x: 165,
    y: -135,
    scale: 0.74,
    rotate: -1,
    opacity: 0.88,
    zIndex: 35,
    isFeatured: false,
    shadowWidth: 230,
    shadowOffset: 20,
    shadowOpacity: 0.18,
    floatDuration: 5.0,
    floatY: 6
  },
  // Slot 4: TOP-RIGHT (Curving Downward)
  {
    slotId: 'slot-4',
    x: 360,
    y: -120,
    scale: 0.64,
    rotate: 0,
    opacity: 0.80,
    zIndex: 25,
    isFeatured: false,
    shadowWidth: 200,
    shadowOffset: 17,
    shadowOpacity: 0.16,
    floatDuration: 4.4,
    floatY: 5
  },
  // Slot 5: MID-FAR-RIGHT
  {
    slotId: 'slot-5',
    x: 535,
    y: -75,
    scale: 0.54,
    rotate: 1,
    opacity: 0.72,
    zIndex: 20,
    isFeatured: false,
    shadowWidth: 170,
    shadowOffset: 15,
    shadowOpacity: 0.14,
    floatDuration: 4.6,
    floatY: 5
  },
  // Slot 6: FAR-RIGHT (Exit Edge)
  {
    slotId: 'slot-6',
    x: 690,
    y: -20,
    scale: 0.44,
    rotate: 2,
    opacity: 0.60,
    zIndex: 15,
    isFeatured: false,
    shadowWidth: 140,
    shadowOffset: 13,
    shadowOpacity: 0.12,
    floatDuration: 4.9,
    floatY: 4
  }
];

export default function FloatingSneakersShowcase({ isStandalonePage = false }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { addItem } = useCartStore();

  const [sneakers, setSneakers] = useState(INITIAL_SNEAKERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('44');
  const [isAdded, setIsAdded] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [dragRatio, setDragRatio] = useState(null);
  const [flyingShoe, setFlyingShoe] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const prevSlotsRef = useRef({});
  const { flyToCart } = useFlyAnimation();

  const total = sneakers.length;
  const current = sneakers[activeIndex] || INITIAL_SNEAKERS[0];

  // Track responsive screen width for adaptive arc positioning
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scaleFactor = useMemo(() => {
    if (viewportWidth < 640) return 0.42;
    if (viewportWidth < 1024) return 0.70;
    if (viewportWidth < 1280) return 0.88;
    return 1.0;
  }, [viewportWidth]);

  // Sync products from backend API while maintaining transparent PNG showcase cutouts
  useEffect(() => {
    let isMounted = true;
    async function syncBackendShoes() {
      try {
        const res = await productService.getAll({ category_slug: 'shoes', page_size: 20 });
        if (isMounted && res?.items?.length > 0) {
          const merged = INITIAL_SNEAKERS.map((initItem) => {
            const match = res.items.find(
              (it) => it.slug === initItem.slug || it.id === initItem.id
            );
            if (match) {
              return {
                ...initItem,
                id: match.id,
                slug: match.slug,
                fullName: match.name,
                stock: match.available_stock ?? match.stock ?? initItem.stock,
                description: match.short_description || match.description || initItem.description
              };
            }
            return initItem;
          });
          setSneakers(merged);
        }
      } catch (err) {
        console.warn('Backend shoe sync fallback to curated Varshi catalogue:', err);
      }
    }
    syncBackendShoes();
    return () => { isMounted = false; };
  }, []);

  // Update prevSlotsRef after each activeIndex change
  useEffect(() => {
    const map = {};
    sneakers.forEach((shoe, idx) => {
      map[shoe.id] = (idx - activeIndex + 2 + total) % total;
    });
    prevSlotsRef.current = map;
  }, [activeIndex, sneakers, total]);

  // Slide forward along the half-moon orbital layout
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  // Slide backward along the half-moon orbital layout
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  // Select a specific shoe
  const handleSelectShoe = (idx) => {
    setActiveIndex(idx);
  };

  // Double click on shoe: smoothly drag/glide to top of details page
  const handleShoeDoubleClick = (shoe) => {
    setFlyingShoe(shoe);
    setTimeout(() => {
      navigate(`/products/${shoe.slug}`);
    }, 450);
  };

  // =========================================================================
  // DRAGGABLE / SCRUBBABLE METALLIC SLIDER LINE WITH SILKY 1:1 FLUID DRAGGING
  // =========================================================================
  const handleScrub = useCallback((clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = clampedX / rect.width;
    setDragRatio(ratio);
    const targetIdx = Math.min(total - 1, Math.max(0, Math.round(ratio * (total - 1))));
    setActiveIndex(targetIdx);
  }, [total]);

  const handleTrackMouseDown = (e) => {
    e.preventDefault();
    setIsScrubbing(true);
    handleScrub(e.clientX);
  };

  const handleTrackTouchStart = (e) => {
    if (e.touches?.[0]) {
      setIsScrubbing(true);
      handleScrub(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isScrubbing) {
        handleScrub(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
        setDragRatio(null);
      }
    };
    const handleTouchMove = (e) => {
      if (isScrubbing && e.touches?.[0]) {
        handleScrub(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
        setDragRatio(null);
      }
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScrubbing, handleScrub]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  // Touch swipe gestures
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Add to Bag with selected size and smooth fly-to-cart animation
  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const activeShoe = sneakers[activeIndex] || INITIAL_SNEAKERS[0];
      const shoeSize = `EU ${selectedSize}`;

      // Trigger fly animation
      const heroShoeImg = document.querySelector('[data-hero-shoe="true"]') || containerRef.current?.querySelector('img');
      if (flyToCart && heroShoeImg) {
        flyToCart(heroShoeImg, activeShoe.image);
      }

      await addItem(
        activeShoe.id,
        1,
        {
          id: activeShoe.id,
          name: activeShoe.fullName || `${activeShoe.titleLine1} ${activeShoe.titleLine2}`,
          price: activeShoe.price,
          image_url: activeShoe.image,
          images: [{ image_url: activeShoe.image }],
          selectedSize: shoeSize,
          size: shoeSize,
          slug: activeShoe.slug,
          brand: 'UNLIMITED choice',
          available_stock: activeShoe.stock || 24,
          sku: `VE-SH-${activeShoe.slug.toUpperCase().slice(0, 8)}-${selectedSize}`
        }
      );
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    } catch (err) {
      console.error('Failed to add shoe to bag:', err);
    }
  };

  // Buy Now with selected size -> smooth fly animation and direct checkout
  const handleBuyNow = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setIsBuying(true);
      const activeShoe = sneakers[activeIndex] || INITIAL_SNEAKERS[0];
      const shoeSize = `EU ${selectedSize}`;

      // Trigger fly animation to cart before checkout
      const heroShoeImg = document.querySelector('[data-hero-shoe="true"]') || containerRef.current?.querySelector('img');
      let hasFlown = false;
      if (flyToCart && heroShoeImg) {
        hasFlown = true;
        flyToCart(heroShoeImg, activeShoe.image, () => {
          navigate('/checkout');
        });
      }

      await addItem(
        activeShoe.id,
        1,
        {
          id: activeShoe.id,
          name: activeShoe.fullName || `${activeShoe.titleLine1} ${activeShoe.titleLine2}`,
          price: activeShoe.price,
          image_url: activeShoe.image,
          images: [{ image_url: activeShoe.image }],
          selectedSize: shoeSize,
          size: shoeSize,
          slug: activeShoe.slug,
          brand: 'UNLIMITED choice',
          available_stock: activeShoe.stock || 24,
          sku: `VE-SH-${activeShoe.slug.toUpperCase().slice(0, 8)}-${selectedSize}`
        }
      );

      if (!hasFlown) {
        navigate('/checkout');
      }
    } catch (err) {
      console.error('Failed to buy now:', err);
      setIsBuying(false);
    }
  };

  return (
    <section
      ref={containerRef}
      id="floating-sneakers-showcase"
      aria-label="UNLIMITED choice Floating Sneaker Showcase"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full overflow-hidden select-none bg-white text-gray-900 flex flex-col justify-between transition-colors duration-500 ${isStandalonePage
        ? 'min-h-[calc(100vh-60px)] py-4 sm:py-6'
        : 'min-h-0 md:min-h-[750px] pt-2 md:pt-4 pb-4 md:pb-2 my-0'
        }`}
    >
      {/* PURE WHITE CANVAS BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #FAFAFA 70%, #F5F5F5 100%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full relative z-10 flex flex-col justify-between flex-1">

        {/* =========================================================================
            MOBILE-FIRST SNEAKER SHOWCASE (< 768px Viewports: 320px - 767px)
            Properly proportioned, non-overlapping, sequential luxury fashion layout
            ========================================================================= */}
        <div className="block md:hidden w-full py-2 space-y-4">
          
          {/* 1. PRODUCT INFORMATION HEADER */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-700">
                Streetwear Footwear
              </span>
            </div>

            {/* Title with TAN MON CHERI font styling */}
            <div
              onClick={() => navigate(`/products/${current.slug}`)}
              className="cursor-pointer group select-none"
              title="Click to view details"
            >
              <h1 className="font-mon-cheri text-2xl sm:text-3xl font-black tracking-wide text-black uppercase leading-tight">
                {current.titleLine1} {current.titleLine2}
              </h1>
            </div>

            {/* Price Line with Strikethrough & Discount Badge */}
            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              <span className="text-2xl font-black text-gray-950 tracking-tight font-sans">
                ₹{current.price.toLocaleString('en-IN')}
              </span>
              {current.originalPrice && (
                <span className="text-sm font-medium text-gray-400 line-through tracking-tight font-sans">
                  ₹{current.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {current.originalPrice && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {Math.round(((current.originalPrice - current.price) / current.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Selected Size indicator badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 pt-0.5">
              <span>Selected Size:</span>
              <span className="bg-stone-100 text-stone-900 px-2 py-0.5 rounded font-mono font-bold border border-stone-200">
                EU {selectedSize}
              </span>
            </div>

            {/* Reference Accent Bar */}
            <div 
              className="w-12 h-1 rounded-full transition-colors duration-300 mt-1" 
              style={{ backgroundColor: current.accentColor || '#16A34A' }}
            />
          </div>

          {/* 2. MAIN SHOE PRESENTATION (Centered Visual Focus + Satellite Carousel) */}
          <div className="relative w-full py-2 flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 via-white to-transparent rounded-2xl pointer-events-none" />

            {/* Primary Hero Shoe Container */}
            <div 
              className="relative w-full max-w-[320px] sm:max-w-[360px] h-[180px] sm:h-[210px] flex items-center justify-center cursor-pointer transition-transform active:scale-98"
              onClick={() => navigate(`/products/${current.slug}`)}
              onDoubleClick={() => handleShoeDoubleClick(current)}
              title="Tap to view product details"
            >
              {/* Contact Ground Shadow */}
              <div className="absolute bottom-1 w-[220px] sm:w-[250px] h-4 bg-black/20 rounded-[100%] blur-md pointer-events-none" />

              {/* Main Shoe Cutout */}
              <img
                src={current.image}
                alt={current.fullName}
                data-hero-shoe="true"
                data-shoe-id={current.id}
                className="w-full h-full object-contain drop-shadow-md select-none"
                style={{
                  transform: current.needsFlip ? 'scaleX(-1)' : 'scaleX(1)',
                  imageRendering: '-webkit-optimize-contrast',
                }}
                loading="eager"
                draggable={false}
              />
            </div>

            {/* Mini Swipeable Sneaker Selector Strip */}
            <div className="w-full mt-3">
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5 mb-1.5">
                <span>Other Colorways & Models ({total})</span>
                <span className="text-[10px] text-stone-400">Swipe to select</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x px-0.5">
                {sneakers.map((shoe, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={shoe.id || idx}
                      type="button"
                      onClick={() => handleSelectShoe(idx)}
                      className={`flex-shrink-0 snap-center flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm scale-102'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <img
                        src={shoe.image}
                        alt={shoe.fullName}
                        className="w-9 h-6 object-contain"
                        style={{ transform: shoe.needsFlip ? 'scaleX(-1)' : 'scaleX(1)' }}
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold leading-none truncate max-w-[80px]">
                          {shoe.titleLine2}
                        </span>
                        <span className={`text-[9px] mt-0.5 leading-none ${isActive ? 'text-emerald-400' : 'text-stone-500'}`}>
                          ₹{shoe.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. SIZE SELECTOR REDESIGN */}
          <div className="w-full space-y-2 pt-1 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Select Shoe Size</span>
              <span className="text-xs font-semibold text-stone-500">
                Selected: <strong className="text-black font-mono">EU {selectedSize}</strong>
              </span>
            </div>

            {/* 7 Responsive Equal Dimensions Size Buttons */}
            <div 
              className="grid grid-cols-7 gap-1.5"
              role="radiogroup"
              aria-label="Sneaker Sizes"
            >
              {current.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
                      isSelected
                        ? 'bg-black text-white border-2 border-black shadow-sm'
                        : 'bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-400 active:scale-95'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. PRODUCT ACTION BUTTONS: ADD TO BAG & BUY NOW */}
          <div className="w-full pt-1 flex items-center gap-2.5">
            {/* Add to Bag Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 px-3 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added To Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Bag</span>
                </>
              )}
            </button>

            {/* Buy Now Button -> Direct Checkout */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isBuying}
              className="flex-1 h-12 inline-flex items-center justify-center gap-1.5 px-3 rounded-full bg-[#173D30] hover:bg-[#122B22] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>{isBuying ? 'Proceeding...' : 'Buy Now'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP MAIN STAGE (md:flex and above: 768px - 1440px+)
            Preserves the original half-moon arc, floating sneakers, and metallic slider
            ========================================================================= */}
        <div className="hidden md:flex relative w-full flex-1 flex-col justify-between min-h-[580px] md:min-h-[630px] pt-2 pb-0">

          {/* =========================================================================
              1. LEFT EDITORIAL HEADER: TAN MON CHERI FONT, PRICE, ADD TO CART & BUY NOW
              ========================================================================= */}
          <div className="absolute top-2 sm:top-4 left-0 z-[70] max-w-sm pointer-events-auto">
            {/* Title with TAN MON CHERI font styling */}
            <div
              onClick={() => navigate(`/products/${current.slug}`)}
              onDoubleClick={() => handleShoeDoubleClick(current)}
              className="cursor-pointer group select-none"
              title="Double-click to glide to product details"
            >
              <h1 className="font-mon-cheri text-4xl sm:text-5xl md:text-6xl font-black tracking-wide text-black uppercase leading-[0.92] drop-shadow-xs">
                {current.titleLine1}
              </h1>
              <h2 className="font-mon-cheri text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-black uppercase leading-[0.92] mt-1 drop-shadow-xs">
                {current.titleLine2}
              </h2>
            </div>

            {/* Price Tag Directly Below the Name (Indian Rupees with Strikethrough) */}
            <div className="mt-3.5 sm:mt-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight font-sans">
                  ₹{current.price.toLocaleString('en-IN')}
                </span>
                {current.originalPrice && (
                  <span className="text-base sm:text-lg font-medium text-gray-400 line-through tracking-tight font-sans">
                    ₹{current.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {current.originalPrice && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    {Math.round(((current.originalPrice - current.price) / current.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Reference Accent Bar */}
              <div 
                className="w-14 sm:w-16 h-1 rounded-full mt-2.5 transition-colors duration-300" 
                style={{ backgroundColor: current.accentColor || '#16A34A' }}
              />
            </div>

            {/* Selected Size Badge */}
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>Selected Size:</span>
              <span className="bg-stone-100 text-stone-900 px-2 py-0.5 rounded font-mono font-bold border border-stone-200">
                EU {selectedSize}
              </span>
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Added To Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add To Bag</span>
                  </>
                )}
              </button>

              {/* Buy Now Button -> Direct Checkout */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isBuying}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>{isBuying ? 'Proceeding...' : 'Buy Now'}</span>
              </button>
            </div>


          </div>

          {/* =========================================================================
              2. SNEAKER CANVAS: 7 SNEAKERS IN HALF-MOON ARC, ALL CRISP & FACING LEFT
              (Shifted down lightly to eliminate bottom gap & fill canvas gracefully)
              ========================================================================= */}
          <div className="relative w-full h-[460px] sm:h-[520px] md:h-[570px] flex items-center justify-center overflow-visible translate-y-6 sm:translate-y-9 md:translate-y-12">

            <div className="relative w-full h-full flex items-center justify-center">
              {sneakers.map((shoe, index) => {
                // Calculate which composition slot this shoe occupies
                // When activeIndex === index, it occupies Slot 2 (featured-highlight)
                const slotIdx = (index - activeIndex + 2 + total) % total;
                const slot = COMPOSITION_SLOTS[slotIdx];
                const isFeatured = slot.isFeatured;

                // Responsive positioning along the half-moon arc
                const animatedX = slot.x * scaleFactor;
                const animatedY = slot.y * (scaleFactor < 1 ? scaleFactor * 0.85 : 1);
                const animatedScale = slot.scale * (scaleFactor < 1 ? Math.max(scaleFactor, 0.70) : 1);

                // Anti-circle logic: Detect if shoe wrapped around from end to start (or vice versa)
                const prevSlot = prevSlotsRef.current[shoe.id];
                const isWrapAround = prevSlot !== undefined && Math.abs(slotIdx - prevSlot) > 2;

                const isFlying = flyingShoe && flyingShoe.id === shoe.id;

                return (
                  <motion.div
                    key={shoe.id || index}
                    animate={
                      isFlying
                        ? {
                          y: -360,
                          x: 0,
                          scale: 1.35,
                          opacity: 1,
                          zIndex: 100,
                          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                        }
                        : {
                          x: animatedX,
                          y: animatedY,
                          scale: animatedScale,
                          rotate: slot.rotate,
                          opacity: flyingShoe ? 0.35 : slot.opacity,
                          zIndex: slot.zIndex,
                        }
                    }
                    whileHover={
                      isFlying
                        ? {}
                        : {
                          y: animatedY - 14,
                          scale: animatedScale * 1.07,
                          transition: { type: 'spring', stiffness: 320, damping: 22 }
                        }
                    }
                    transition={
                      isWrapAround
                        ? {
                          x: { duration: 0 },
                          y: { duration: 0 },
                          scale: { duration: 0 },
                          rotate: { duration: 0 },
                          opacity: { duration: 0.3, ease: 'easeOut' }
                        }
                        : {
                          type: 'spring',
                          stiffness: 110,
                          damping: 18,
                          mass: 0.65
                        }
                    }
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      transformOrigin: 'center center',
                      willChange: 'transform, opacity'
                    }}
                    onClick={() => {
                      if (isFeatured) {
                        navigate(`/products/${shoe.slug}`);
                      } else {
                        handleSelectShoe(index);
                      }
                    }}
                    onDoubleClick={() => {
                      handleShoeDoubleClick(shoe);
                    }}
                    className="group select-none"
                    title={`Double-click to glide to ${shoe.fullName} · Click to focus`}
                  >
                    {/* INDEPENDENT FLOATING / BREATHING MOTION */}
                    <motion.div
                      animate={
                        shouldReduceMotion || isFlying
                          ? {}
                          : {
                            y: [0, -slot.floatY, 0],
                          }
                      }
                      transition={{
                        duration: slot.floatDuration,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="relative flex flex-col items-center justify-center"
                    >
                      {/* Individual Contact Ground Shadow for realistic floating depth */}
                      <motion.div
                        animate={
                          shouldReduceMotion || isFlying
                            ? {}
                            : {
                              scale: [1, 0.94, 1],
                              opacity: [slot.shadowOpacity, slot.shadowOpacity * 0.75, slot.shadowOpacity]
                            }
                        }
                        transition={{
                          duration: slot.floatDuration,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          width: `${slot.shadowWidth}px`,
                          bottom: `-${slot.shadowOffset}px`
                        }}
                        className="absolute h-5 bg-black/25 rounded-[100%] blur-md pointer-events-none"
                      />

                      {/* 100% Pure Transparent Sneaker Cutout (1200x896 Ultra HD):
                          High-resolution rendering with crisp subpixel optimization */}
                      <img
                        src={shoe.image}
                        alt={shoe.fullName}
                        data-hero-shoe={isFeatured ? 'true' : undefined}
                        data-shoe-id={shoe.id}
                        className="w-[320px] sm:w-[380px] md:w-[440px] lg:w-[480px] h-[190px] sm:h-[225px] md:h-[260px] lg:h-[285px] object-contain drop-shadow-sm pointer-events-none"
                        style={{
                          transform: shoe.needsFlip ? 'scaleX(-1)' : 'scaleX(1)',
                          imageRendering: '-webkit-optimize-contrast',
                          backfaceVisibility: 'hidden',
                          transformOrigin: 'center center'
                        }}
                        loading="eager"
                        decoding="sync"
                        draggable={false}
                      />

                      {/* Satellite Shoe Hover Pill */}
                      {!isFeatured && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-5 bg-black/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-md pointer-events-none">
                          {shoe.titleLine2} · Double-click to buy
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* =========================================================================
                3. INTERACTIVE DRAGGABLE METALLIC SLIDER LINE (PURE NEUTRAL & SILKY SMOOTH)
                (100% Contained Inside The Capsule Track - Zero Overhang)
                ========================================================================= */}
            <div className="absolute bottom-5 sm:bottom-7 md:bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
              {/* Draggable Metallic Capsule Track - 100% Neutral, Zero Green */}
              <div
                ref={trackRef}
                onMouseDown={handleTrackMouseDown}
                onTouchStart={handleTrackTouchStart}
                className="w-56 sm:w-72 md:w-80 h-4.5 sm:h-5 rounded-full bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 border border-stone-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.08)] relative cursor-grab active:cursor-grabbing select-none p-0.5 overflow-hidden transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] group flex items-center"
                title="Drag smoothly to rotate sneakers"
              >
                {/* Inner Track Runway: 100% Constrains the Pill Thumb Inside */}
                <div className="relative w-full h-full">
                  {/* Draggable Metallic Thumb Pill Button - Pure Neutral Metallic */}
                  <motion.div
                    animate={{
                      left: `calc(${Math.min(1, Math.max(0, dragRatio !== null && isScrubbing ? dragRatio : activeIndex / (total - 1)))} * (100% - 44px))`,
                    }}
                    transition={
                      isScrubbing
                        ? { type: 'tween', ease: 'linear', duration: 0 }
                        : { type: 'spring', stiffness: 280, damping: 26 }
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    className="absolute top-0 bottom-0 w-[44px] rounded-full bg-gradient-to-b from-white via-stone-100 to-stone-300 shadow-[0_2px_5px_rgba(0,0,0,0.32),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-stone-400/80 pointer-events-none group-hover:border-stone-500"
                  />
                </div>
              </div>



            </div>

            {/* =========================================================================
                4. BOTTOM-RIGHT BOXED SIZE SELECTOR (MEDIUM SIZE: 40-43 / 44-46)
                ========================================================================= */}
            <div className="absolute bottom-2 sm:bottom-4 md:bottom-5 right-0 sm:right-2 z-[70] pointer-events-auto">
              <div
                className="flex flex-col gap-2 sm:gap-2.5"
                role="radiogroup"
                aria-label="Sneaker Sizes"
              >
                {/* Row 1: 40, 41, 42, 43 */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {current.sizes.slice(0, 4).map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${isSelected
                          ? 'bg-black text-white border-2 border-black shadow-sm scale-102'
                          : 'bg-white text-stone-800 border-2 border-stone-200/90 hover:border-stone-400 shadow-2xs hover:shadow-xs hover:bg-stone-50 active:scale-95'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Row 2: 44, 45, 46 (Left-aligned under 40, 41, 42) */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {current.sizes.slice(4).map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${isSelected
                          ? 'bg-black text-white border-2 border-black shadow-sm scale-102'
                          : 'bg-white text-stone-800 border-2 border-stone-200/90 hover:border-stone-400 shadow-2xs hover:shadow-xs hover:bg-stone-50 active:scale-95'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
