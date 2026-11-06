import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { OUTFITS } from '../../data/outfitsData';

export default function OutfitStudioSection({ isStandalonePage = false }) {
  const navigate = useNavigate();

  // Current Active Outfit Index for the center model
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeOutfit = OUTFITS[currentIndex] || OUTFITS[0];

  // Previous and Next Outfit indices (clothes only)
  const prevIndex = (currentIndex - 1 + OUTFITS.length) % OUTFITS.length;
  const nextIndex = (currentIndex + 1) % OUTFITS.length;
  const prevOutfit = OUTFITS[prevIndex];
  const nextOutfit = OUTFITS[nextIndex];

  // Flying Clothes Animation State: { side: 'left' | 'right', targetOutfit: object } | null
  const [flyingTransition, setFlyingTransition] = useState(null);

  // 360 Rotation State & Drag Physics
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ isDragging: false, startX: 0, startAngle: 0, hasDragged: false });

  // Touch Swipe coordinates for Mobile
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  // Preload all transparent outfit images (front and back)
  useEffect(() => {
    OUTFITS.forEach(outfit => {
      const imgFront = new Image();
      imgFront.src = outfit.frontImage;
      if (outfit.backImage) {
        const imgBack = new Image();
        imgBack.src = outfit.backImage;
      }
      outfit.hotspots?.forEach(h => {
        if (h.image) {
          const gImg = new Image();
          gImg.src = h.image;
        }
      });
    });
  }, []);

  // Apply Previous Outfit: Left garments glide across and the single model wears that outfit
  const handleApplyPrev = useCallback(() => {
    if (flyingTransition) return;
    setFlyingTransition({ side: 'left', targetOutfit: prevOutfit, targetIndex: prevIndex });
    setTimeout(() => {
      setRotationAngle(0);
      setCurrentIndex(prevIndex);
      setFlyingTransition(null);
    }, 450);
  }, [prevIndex, prevOutfit, flyingTransition]);

  // Apply Next Outfit: Right garments glide across and the single model wears that outfit
  const handleApplyNext = useCallback(() => {
    if (flyingTransition) return;
    setFlyingTransition({ side: 'right', targetOutfit: nextOutfit, targetIndex: nextIndex });
    setTimeout(() => {
      setRotationAngle(0);
      setCurrentIndex(nextIndex);
      setFlyingTransition(null);
    }, 450);
  }, [nextIndex, nextOutfit, flyingTransition]);

  // Keyboard Left / Right Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleApplyNext();
      } else if (e.key === 'ArrowLeft') {
        handleApplyPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleApplyNext, handleApplyPrev]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    if (distance > 45) {
      handleApplyNext();
    } else if (distance < -45) {
      handleApplyPrev();
    }
    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };

  // 360 Pointer Drag Handlers on the Center Model
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startAngle: rotationAngle,
      hasDragged: false
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    if (Math.abs(deltaX) > 4) {
      dragRef.current.hasDragged = true;
    }
    setRotationAngle(dragRef.current.startAngle + deltaX * 0.85);
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  // 360 Normalized Angle & Front / Back view detection
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
  const isFacingBack = normalizedAngle >= 90 && normalizedAngle <= 270;

  // Render individual clothing items column:
  // Clicking the outfit or any of its garments puts that outfit directly on the model!
  // Hovering on a garment also shows a direct link icon to its product details page.
  const renderClothesOnlyColumn = (outfit, side) => {
    if (!outfit || !outfit.hotspots) return null;

    const isLeft = side === 'left';
    const applyHandler = isLeft ? handleApplyPrev : handleApplyNext;

    return (
      <div
        onClick={applyHandler}
        className="w-full flex flex-col items-center justify-center gap-2.5 sm:gap-3 p-2 cursor-pointer group/rack select-none"
        title={isLeft ? "Click to wear Previous Outfit on Model" : "Click to wear Next Outfit on Model"}
      >
        {outfit.hotspots.map((garment) => (
          <div
            key={garment.id}
            onClick={(e) => {
              e.stopPropagation();
              // Clicking any garment immediately wears this complete outfit on the model!
              applyHandler();
            }}
            className="group relative w-14 sm:w-18 md:w-22 aspect-square flex items-center justify-center bg-transparent cursor-pointer rounded-xl p-1 transition-all duration-300 hover:scale-115 active:scale-90"
            title={`Click to wear this outfit on the model (${garment.name})`}
          >
            <img
              src={garment.image}
              alt={garment.name}
              className="w-full h-full object-contain filter drop-shadow-sm group-hover:drop-shadow-lg transition-all"
              loading="eager"
            />
            {/* Quick Product Details Link: For user who wants to view the item page directly without wearing */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${garment.slug}`);
              }}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-[#16382C] text-[#16382C] hover:text-[#C5A880] rounded-full p-1 shadow-md border border-gray-200 cursor-pointer z-20"
              title={`View ${garment.name} product details`}
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`w-full bg-[#FFFFFF] flex flex-col items-center justify-center relative overflow-hidden select-none ${
        isStandalonePage ? 'min-h-[82vh] py-2' : 'py-3 sm:py-5'
      }`}
    >
      {/* 3-COLUMN STAGE: 
          [PREV OUTFIT: CLOTHES ONLY] <--- [CENTER MODEL: SAME PERSON] ---> [NEXT OUTFIT: CLOTHES ONLY] 
          Fits entirely inside single viewport frame without scrolling!
      */}
      <div
        className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-6 h-[66vh] max-h-[540px] min-h-[440px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* =========================================================================
            LEFT COLUMN: PREVIOUS OUTFIT (CLOTHES ONLY) + LEFT ARROW
            ========================================================================= */}
        <div className="flex-1 flex items-center justify-center relative max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
          {/* Left Arrow Button (Triggers clothes gliding onto model) */}
          <button
            type="button"
            onClick={handleApplyPrev}
            aria-label="Wear Previous Outfit"
            className="absolute -left-1 sm:-left-3 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-gray-900 border border-gray-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
            title="Wear Previous Outfit"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800 group-hover:text-[#16382C] group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Clothes Only Column: Clicking any garment opens its product details page */}
          <div className="w-full flex items-center justify-center">
            {renderClothesOnlyColumn(prevOutfit, 'left')}
          </div>
        </div>

        {/* =========================================================================
            CENTER: THE ONE SAME MALE MODEL (NO SECOND MODEL EVER COMES TO MIDDLE)
            ========================================================================= */}
        <div className="flex-[2] h-full flex items-center justify-center relative max-w-[340px] sm:max-w-[390px] md:max-w-[430px] lg:max-w-[460px]">
          
          {/* Draggable 360 Model Container */}
          <div
            className={`relative w-full h-full flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={() => {
              if (!dragRef.current.hasDragged) {
                setRotationAngle(prev => (prev === 0 ? 180 : 0));
              }
            }}
          >
            {/* The One Same Center Model (Positioned in exact center, never duplicates side-by-side) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={`${activeOutfit.id}-${isFacingBack ? 'back' : 'front'}`}
                  src={isFacingBack ? (activeOutfit.backImage || activeOutfit.frontImage) : activeOutfit.frontImage}
                  alt={activeOutfit.name}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="w-full h-full object-contain object-center drop-shadow-xs"
                  style={{
                    maxHeight: '100%',
                  }}
                  loading="eager"
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {/* INTERACTIVE GARMENT HOTSPOT WHITE DOTS ON THE MODEL'S CLOTHING */}
            {!isFacingBack && activeOutfit.hotspots?.map((spot) => (
              <div
                key={spot.id}
                className="absolute z-30"
                style={{
                  top: `${spot.top}%`,
                  left: `${spot.left}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Clean White Hotspot Dot: Clicking takes directly to that exact product details page! */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${spot.slug}`);
                  }}
                  className="relative group p-2.5 flex items-center justify-center cursor-pointer"
                  aria-label={spot.name}
                  title={`View ${spot.name}`}
                >
                  {/* Subtle outer pulsing wave ring */}
                  <span className="absolute w-7 h-7 rounded-full bg-white/50 animate-ping" />
                  {/* Soft glow halo */}
                  <span className="absolute w-5 h-5 rounded-full bg-white/70 group-hover:scale-125 transition-transform" />
                  {/* Clean White Pin with Forest Ring */}
                  <span className="relative w-4 h-4 rounded-full bg-white border-2 border-[#16382C] shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16382C]" />
                  </span>
                </button>
              </div>
            ))}

            {/* =========================================================================
                SMOOTH GLIDING CLOTHES ANIMATION DIRECTLY ONTO THE ONE MODEL
                ========================================================================= */}
            <AnimatePresence>
              {flyingTransition && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                  {flyingTransition.targetOutfit?.hotspots?.map((garment, idx) => {
                    const startX = flyingTransition.side === 'left' ? -280 : 280;
                    const startY = (idx - 1.5) * 60;
                    const targetY = (garment.top ? (garment.top - 50) * 4 : 0);

                    return (
                      <motion.div
                        key={`flying-${garment.id}`}
                        initial={{
                          x: startX,
                          y: startY,
                          opacity: 1,
                          scale: 0.9,
                          rotate: flyingTransition.side === 'left' ? -8 : 8,
                        }}
                        animate={{
                          x: 0,
                          y: targetY,
                          opacity: [1, 1, 0],
                          scale: [0.9, 1.05, 1],
                          rotate: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.42,
                          delay: idx * 0.03,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute w-20 sm:w-26 md:w-30 aspect-square flex items-center justify-center filter drop-shadow-lg"
                      >
                        <img
                          src={garment.image}
                          alt={garment.name}
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: NEXT OUTFIT (CLOTHES ONLY) + RIGHT ARROW
            ========================================================================= */}
        <div className="flex-1 flex items-center justify-center relative max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
          {/* Clothes Only Column: Clicking any garment opens its product details page */}
          <div className="w-full flex items-center justify-center">
            {renderClothesOnlyColumn(nextOutfit, 'right')}
          </div>

          {/* Right Arrow Button (Triggers clothes gliding onto model) */}
          <button
            type="button"
            onClick={handleApplyNext}
            aria-label="Wear Next Outfit"
            className="absolute -right-1 sm:-right-3 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-gray-900 border border-gray-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
            title="Wear Next Outfit"
          >
            <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-[#16382C] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
