import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ className = "h-10 sm:h-12 md:h-13", showText = false, textDark = true }) {
  return (
    <Link 
      to="/" 
      className="inline-flex items-center group select-none transition-transform duration-200 hover:opacity-90 active:scale-[0.98]" 
      aria-label="UNLIMITED choice Home"
    >
      {/* High-Definition Transparent Luxury Brand Logo - Zero Borders, Zero Cutoffs */}
      <img
        src="/logo.png"
        alt="UNLIMITED choice — Wear More • Choose Better"
        className={`${className} w-auto object-contain block drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}
      />
    </Link>
  );
}
