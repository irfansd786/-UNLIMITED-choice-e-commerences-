import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ROD_IMAGE = "https://static.joonsite.com/storage/42826/media/2610071101546924.webp";

const RACK_PRODUCTS = [
  {
    id: 43,
    name: "Midnight Navy Work Chore Jacket",
    slug: "midnight-navy-work-chore-jacket",
    subtitle: "Tailored heavy duck canvas • Navy",
    category: "jackets",
    badge: "14OZ DUCK CANVAS",
    price: 3899,
    compareAtPrice: 5499,
    stock: 16,
    material: "14oz Brushed Cotton Duck Canvas",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071515248388.webp",
    frontImage: "/images/variants/midnight-navy-work-chore-jacket_original_front.webp",
    backImage: "/images/variants/midnight-navy-work-chore-jacket_original_back.webp",
  },
  {
    id: 44,
    name: "Heather Grey Heavy Fleece Hoodie",
    slug: "heather-grey-heavy-fleece-hoodie",
    subtitle: "450GSM loopback cotton • Grey melange",
    category: "hoodies",
    badge: "LOOPBACK FLEECE",
    price: 2899,
    compareAtPrice: 4499,
    stock: 22,
    material: "100% Combed Melange Cotton Fleece (450 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071514447647.webp",
    frontImage: "/images/variants/heather-grey-heavy-fleece-hoodie_original_front.webp",
    backImage: "/images/variants/heather-grey-heavy-fleece-hoodie_original_back.webp",
  },
  {
    id: 45,
    name: "Jet Black Compact Drop-Shoulder Tee",
    slug: "jet-black-compact-drop-shoulder-tee",
    subtitle: "260GSM combed compact cotton • Onyx",
    category: "t-shirts",
    badge: "260GSM BOXY TEE",
    price: 1299,
    compareAtPrice: 1999,
    stock: 35,
    material: "100% Combed Compact Cotton (260 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071516549024.webp",
    frontImage: "/images/variants/jet-black-compact-drop-shoulder-tee_original_front.webp",
    backImage: "/images/variants/jet-black-compact-drop-shoulder-tee_original_back.webp",
  },
  {
    id: 46,
    name: "Forest Green Box-Fit Hoodie",
    slug: "forest-green-box-fit-hoodie",
    subtitle: "Oversized fit • Bottle green",
    category: "hoodies",
    badge: "DROP SHOULDER",
    price: 2899,
    compareAtPrice: 4499,
    stock: 19,
    material: "100% French Terry Cotton Fleece (450 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071517049148.webp",
    frontImage: "/images/variants/forest-green-box-fit-hoodie_original_front.webp",
    backImage: "/images/variants/forest-green-box-fit-hoodie_original_back.webp",
  },
  {
    id: 47,
    name: "Classic Cream Supima Boxy Tee",
    slug: "classic-cream-supima-boxy-tee",
    subtitle: "Luxury Supima staple • Off-white bone",
    category: "t-shirts",
    badge: "SUPIMA COTTON",
    price: 1399,
    compareAtPrice: 2199,
    stock: 28,
    material: "100% Long-Staple Supima Cotton (240 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071517384792.webp",
    frontImage: "/images/variants/classic-cream-supima-boxy-tee_original_front.webp",
    backImage: "/images/variants/classic-cream-supima-boxy-tee_original_back.webp",
  },
  {
    id: 48,
    name: "Vintage Mineral Acid-Wash Hoodie",
    slug: "vintage-mineral-acid-wash-hoodie",
    subtitle: "Acid mineral fade • Dusty plum sage",
    category: "hoodies",
    badge: "ACID MINERAL WASH",
    price: 2999,
    compareAtPrice: 4699,
    stock: 18,
    material: "100% Mineral-Washed Fleece Cotton (420 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071514272856.webp",
    frontImage: "/images/variants/vintage-mineral-acid-wash-hoodie_original_front.webp",
    backImage: "/images/variants/vintage-mineral-acid-wash-hoodie_original_back.webp",
  },
  {
    id: 49,
    name: "Cyber Tokyo Typographic Graphic Tee",
    slug: "cyber-tokyo-typographic-graphic-tee",
    subtitle: "High-density puff print • Relaxed streetwear",
    category: "t-shirts",
    badge: "PUFF PRINT TEE",
    price: 1499,
    compareAtPrice: 2399,
    stock: 30,
    material: "100% Combed Cotton (260 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071517558243.png",
    frontImage: "/images/variants/cyber-tokyo-typographic-graphic-tee_original_front.webp",
    backImage: "/images/variants/cyber-tokyo-typographic-graphic-tee_original_back.webp",
  },
  {
    id: 50,
    name: "Textured Waffle-Knit Streetwear Polo",
    slug: "textured-waffle-knit-streetwear-polo",
    subtitle: "Honeycomb weave • Relaxed camp collar",
    category: "t-shirts",
    badge: "HONEYCOMB POLO",
    price: 1799,
    compareAtPrice: 2699,
    stock: 20,
    material: "100% Breathable Honeycomb Waffle Cotton (280 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071516260505.webp",
    frontImage: "/images/variants/textured-waffle-knit-streetwear-polo_original_front.webp",
    backImage: "/images/variants/textured-waffle-knit-streetwear-polo_original_back.webp",
  },
  {
    id: 42,
    name: "Cryptic Celestis Oversized Hoodie",
    slug: "cryptic-celestis-oversized-hoodie",
    subtitle: "Oversized hoodie • Washed black",
    category: "hoodies",
    badge: "450GSM FLEECE",
    price: 2899,
    compareAtPrice: 4499,
    stock: 25,
    material: "100% Heavy French Terry Cotton (450 GSM)",
    sideImage: "https://static.joonsite.com/storage/42826/media/2610071101516777.webp",
    frontImage: "/images/variants/cryptic-celestis-oversized-hoodie_original_front.webp",
    backImage: "/images/variants/cryptic-celestis-oversized-hoodie_original_back.webp",
  }
];

// Triplicated product array for seamless infinite right-to-left rotation
const DISPLAY_PRODUCTS = [...RACK_PRODUCTS, ...RACK_PRODUCTS, ...RACK_PRODUCTS];

export default function HangingRackShowcase() {
  const navigate = useNavigate();
  const rackRef = useRef(null);

  // Hover state on individual garments
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isHoveredRack, setIsHoveredRack] = useState(false);

  // Mouse & Touch drag state for the rack
  const [isDraggingRack, setIsDraggingRack] = useState(false);
  const rackDragRef = useRef({ isDown: false, startX: 0, startOffset: 0, hasMoved: false });
  const offsetRef = useRef(0);
  const isPausedRef = useRef(false);

  // Physics-based inertia tilt tracking
  const lastXRef = useRef(0);
  const tiltAngleRef = useRef(0);
  const decayAnimIdRef = useRef(null);
  const clickTimerRef = useRef(null);

  // Clean up click timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  // Pause rotation when hovering or dragging
  useEffect(() => {
    isPausedRef.current = hoveredIdx !== null || isHoveredRack || isDraggingRack;
  }, [hoveredIdx, isHoveredRack, isDraggingRack]);

  // Infinite right-to-left smooth continuous rotation (Hardware-accelerated translate3d, ZERO scrollbar)
  useEffect(() => {
    const track = rackRef.current;
    if (!track) return;

    let animId;
    const speed = 0.95; // smooth luxury glide speed (~55px/sec)

    const scrollLoop = () => {
      if (!isPausedRef.current && track) {
        const oneSetWidth = track.scrollWidth / 3;
        if (oneSetWidth > 0) {
          offsetRef.current += speed;
          if (offsetRef.current >= oneSetWidth) {
            offsetRef.current -= oneSetWidth;
          }
          track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
        }
      }
      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Mouse wheel horizontal translation with infinite wrap & subtle tilt
  useEffect(() => {
    const track = rackRef.current;
    if (!track) return;
    const container = track.parentElement;
    if (!container) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const oneSetWidth = track.scrollWidth / 3;
        if (oneSetWidth > 0) {
          let next = offsetRef.current + e.deltaY * 1.2;
          next = ((next % oneSetWidth) + oneSetWidth) % oneSetWidth;
          offsetRef.current = next;
          track.style.transform = `translate3d(-${next}px, 0, 0)`;

          // Opposite tilt during wheel movement
          const wheelTilt = Math.max(-14, Math.min(14, (e.deltaY > 0 ? 8 : -8)));
          track.style.setProperty('--rack-tilt', `${wheelTilt}deg`);
          setTimeout(() => {
            if (!rackDragRef.current.isDown && track) {
              track.style.setProperty('--rack-tilt', '0deg');
            }
          }, 180);
        }
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Mouse Drag-To-Scroll handlers with real-time opposite direction inertia tilt
  const handleRackMouseDown = (e) => {
    rackDragRef.current = {
      isDown: true,
      startX: e.pageX,
      startOffset: offsetRef.current,
      hasMoved: false
    };
    lastXRef.current = e.pageX;
    setIsDraggingRack(true);
    if (decayAnimIdRef.current) cancelAnimationFrame(decayAnimIdRef.current);
  };

  const handleRackMouseMove = (e) => {
    if (!rackDragRef.current.isDown || !rackRef.current) return;
    const currentX = e.pageX;
    const deltaX = currentX - rackDragRef.current.startX;
    const stepDx = currentX - lastXRef.current;
    lastXRef.current = currentX;

    if (Math.abs(deltaX) > 4) {
      rackDragRef.current.hasMoved = true;
    }

    // Dynamic tilt in OPPOSITE direction of drag:
    // Drag left (stepDx < 0) -> tilt right (positive deg)
    // Drag right (stepDx > 0) -> tilt left (negative deg)
    const targetTilt = Math.max(-20, Math.min(20, -stepDx * 1.4));
    tiltAngleRef.current = targetTilt;
    rackRef.current.style.setProperty('--rack-tilt', `${targetTilt}deg`);

    const oneSetWidth = rackRef.current.scrollWidth / 3;
    if (oneSetWidth > 0) {
      let next = rackDragRef.current.startOffset - deltaX;
      next = ((next % oneSetWidth) + oneSetWidth) % oneSetWidth;
      offsetRef.current = next;
      rackRef.current.style.transform = `translate3d(-${next}px, 0, 0)`;
    }
  };

  const handleRackMouseUpOrLeave = () => {
    if (!rackDragRef.current.isDown) return;
    rackDragRef.current.isDown = false;
    setIsDraggingRack(false);

    // Natural pendulum spring decay back to upright (0deg)
    let currentTilt = tiltAngleRef.current;
    let velocity = -currentTilt * 0.14;

    const springSettle = () => {
      velocity += (-currentTilt * 0.09) - (velocity * 0.16);
      currentTilt += velocity;
      tiltAngleRef.current = currentTilt;
      if (rackRef.current) {
        rackRef.current.style.setProperty('--rack-tilt', `${currentTilt.toFixed(2)}deg`);
      }
      if (Math.abs(currentTilt) > 0.08 || Math.abs(velocity) > 0.08) {
        decayAnimIdRef.current = requestAnimationFrame(springSettle);
      } else {
        tiltAngleRef.current = 0;
        if (rackRef.current) rackRef.current.style.setProperty('--rack-tilt', '0deg');
      }
    };
    decayAnimIdRef.current = requestAnimationFrame(springSettle);
  };

  // Touch Swipe handlers for mobile with real-time opposite direction inertia tilt
  const handleRackTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      const pageX = e.touches[0].pageX;
      rackDragRef.current = {
        isDown: true,
        startX: pageX,
        startOffset: offsetRef.current,
        hasMoved: false
      };
      lastXRef.current = pageX;
      setIsDraggingRack(true);
      if (decayAnimIdRef.current) cancelAnimationFrame(decayAnimIdRef.current);
    }
  };

  const handleRackTouchMove = (e) => {
    if (!rackDragRef.current.isDown || !rackRef.current || !e.touches || !e.touches[0]) return;
    const currentX = e.touches[0].pageX;
    const deltaX = currentX - rackDragRef.current.startX;
    const stepDx = currentX - lastXRef.current;
    lastXRef.current = currentX;

    if (Math.abs(deltaX) > 4) {
      rackDragRef.current.hasMoved = true;
    }

    const targetTilt = Math.max(-20, Math.min(20, -stepDx * 1.4));
    tiltAngleRef.current = targetTilt;
    rackRef.current.style.setProperty('--rack-tilt', `${targetTilt}deg`);

    const oneSetWidth = rackRef.current.scrollWidth / 3;
    if (oneSetWidth > 0) {
      let next = rackDragRef.current.startOffset - deltaX;
      next = ((next % oneSetWidth) + oneSetWidth) % oneSetWidth;
      offsetRef.current = next;
      rackRef.current.style.transform = `translate3d(-${next}px, 0, 0)`;
    }
  };

  const handleRackTouchEnd = () => {
    handleRackMouseUpOrLeave();
  };

  // Single-click -> 360 Degree Interactive Studio Page (/studio/:slug)
  // Double-click -> Full Product Details Page (/products/:slug)
  const handleGarmentClick = (prod) => {
    if (rackDragRef.current.hasMoved) return;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    clickTimerRef.current = setTimeout(() => {
      navigate(`/studio/${prod.slug}`);
      clickTimerRef.current = null;
    }, 240);
  };

  const handleGarmentDoubleClick = (prod) => {
    if (rackDragRef.current.hasMoved) return;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    navigate(`/products/${prod.slug}`);
  };

  return (
    <section className="relative bg-white text-[#1A2621] pt-2 pb-2 select-none overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 relative">

        {/* The Rail Stage (Metallic Rod + Auto-Rotating Hanging Garments, ZERO Scrollbars, ZERO Lines, Pure White Background) */}
        <div
          className="relative pt-4 pb-2 overflow-hidden"
          onMouseEnter={() => setIsHoveredRack(true)}
          onMouseLeave={() => {
            setIsHoveredRack(false);
            handleRackMouseUpOrLeave();
          }}
          onMouseDown={handleRackMouseDown}
          onMouseMove={handleRackMouseMove}
          onMouseUp={handleRackMouseUpOrLeave}
          onTouchStart={handleRackTouchStart}
          onTouchMove={handleRackTouchMove}
          onTouchEnd={handleRackTouchEnd}
        >
          {/* Physical Rod / Hanging Pipe */}
          <div className="absolute top-[22px] left-0 right-0 h-[8px] pointer-events-none z-20">
            <img
              src={ROD_IMAGE}
              alt="Streetwear Studio Rail"
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-[26px] object-fill drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]"
              loading="eager"
            />
          </div>

          {/* Hanging Garments Track (Continuous Hardware-Accelerated Right-to-Left Infinite Loop, Zero Scrollbar, Zero Line) */}
          <div
            ref={rackRef}
            className={`flex items-start justify-start gap-4 sm:gap-6 pt-4 pb-2 min-h-[340px] sm:min-h-[380px] will-change-transform select-none ${isDraggingRack ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            style={{
              width: 'max-content',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            {DISPLAY_PRODUCTS.map((prod, idx) => {
              const isHovered = hoveredIdx === idx;
              const swayDelays = ['0s', '0.6s', '1.2s', '1.8s', '2.4s', '0.9s', '1.5s', '2.1s', '2.7s'];
              const delay = swayDelays[idx % swayDelays.length];
              const weight = (0.94 + (idx % 4) * 0.04).toFixed(2);

              return (
                <div
                  key={`${prod.id}-${idx}`}
                  onClick={() => handleGarmentClick(prod)}
                  onDoubleClick={() => handleGarmentDoubleClick(prod)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex-shrink-0 flex flex-col items-center justify-start relative transition-all duration-500 ease-out cursor-pointer ${isHovered
                    ? 'w-[210px] sm:w-[230px] mx-2 sm:mx-3 z-30'
                    : 'w-[95px] sm:w-[110px] z-10'
                    }`}
                  style={{
                    height: '330px'
                  }}
                >
                  {/* Hanging Garment Sway Wrapper with dynamic opposite inertia tilt */}
                  <div
                    className={`relative w-full h-[320px] transform-gpu origin-top ${isHovered ? 'scale-105' : (!isDraggingRack ? 'animate-hanger-sway' : '')
                      }`}
                    style={{
                      animationDelay: delay,
                      transform: isHovered
                        ? 'scale(1.05) rotate(0deg)'
                        : `rotate(calc(var(--rack-tilt, 0deg) * ${weight}))`,
                      transformOrigin: 'top center',
                      transition: isDraggingRack
                        ? 'none'
                        : 'transform 0.55s cubic-bezier(0.18, 0.89, 0.32, 1.28), width 0.5s ease-out',
                    }}
                  >
                    {/* SIDE VIEW (Default profile on the rail) */}
                    <div
                      className="absolute inset-0 flex items-start justify-center transition-all duration-500 ease-out pointer-events-none origin-top"
                      style={{
                        opacity: isHovered ? 0 : 1,
                        transform: isHovered
                          ? 'perspective(900px) rotateY(-85deg) scale(0.92)'
                          : 'none',
                        willChange: 'opacity, transform'
                      }}
                    >
                      <img
                        src={prod.sideImage}
                        alt={`${prod.name} profile`}
                        className="h-full w-auto max-w-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.14)]"
                        loading="eager"
                        decoding="async"
                      />
                    </div>

                    {/* FRONT VIEW (Swings forward on hover) */}
                    <div
                      className="absolute inset-0 flex items-start justify-center transition-all duration-500 ease-out pointer-events-none origin-top"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered
                          ? 'perspective(900px) rotateY(0deg) scale(1.05)'
                          : 'perspective(900px) scale(0.9)',
                        willChange: 'opacity, transform'
                      }}
                    >
                      <img
                        src={prod.frontImage}
                        alt={`${prod.name} front presentation`}
                        className="h-full w-auto max-w-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.24)]"
                        loading="eager"
                        decoding="async"
                      />
                    </div>

                    {/* Small Attached Boutique Price Tag */}
                    <div
                      className={`absolute top-1 right-2 sm:right-3 z-40 pointer-events-none transition-all duration-400 ease-out origin-top ${isHovered
                        ? 'opacity-100 scale-100 translate-y-0 rotate-[5deg]'
                        : 'opacity-0 scale-75 -translate-y-3 pointer-events-none'
                        }`}
                    >
                      {/* Attached Twine String */}
                      <div className="w-[1.5px] h-3.5 bg-stone-400 mx-auto" />

                      {/* Tag Card */}
                      <div className="bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.18)] flex flex-col items-center min-w-[58px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-200 border border-stone-400 mb-0.5" />
                        <span className="text-[7.5px] font-bold tracking-widest text-stone-400 uppercase leading-none font-sans">
                          UNLIMITED
                        </span>
                        <span className="text-[11px] sm:text-xs font-black text-stone-900 font-sans tracking-tight leading-none mt-1">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-[8px] text-stone-400 line-through leading-none mt-0.5">
                            ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM "OBSESSED" EDITORIAL WATERMARK (BELOW HANGING SHIRTS SECTION) */}
        <div className="w-full text-center pointer-events-none select-none overflow-hidden my-1 sm:my-2 py-0.5 sm:py-1">
          <span 
            className="font-black text-black/90 uppercase leading-none font-sans block tracking-[-0.03em] sm:tracking-[-0.05em]"
            style={{
              fontSize: 'clamp(2rem, 9.5vw, 7.5rem)'
            }}
          >
            OBSESSED
          </span>
        </div>

      </div>
    </section>
  );
}

