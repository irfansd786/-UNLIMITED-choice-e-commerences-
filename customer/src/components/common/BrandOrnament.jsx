import React from 'react';

export default function BrandOrnament({ text = "Quality You Can Trust", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 my-2 ${className}`}>
      <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-gold-400 to-gold-500"></div>
      
      {/* 3-leaf motif (2 emerald leaves, 1 gold leaf) */}
      <div className="flex items-center gap-1.5 text-forest-800">
        <svg className="w-5 h-5 text-gold-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9.5 6 6 8 3 9C6 11 8.5 13 10 17C11.5 13 14 11 17 9C14 8 10.5 6 12 2Z" fill="#BFA36D"/>
          <path d="M12 22C14.5 18 18 16 21 15C18 13 15.5 11 14 7C12.5 11 10 13 7 15C10 16 13.5 18 12 22Z" fill="#16382C"/>
        </svg>
        {text && (
          <span className="font-serif italic text-xs tracking-wider text-forest-900 font-semibold px-1">
            {text}
          </span>
        )}
        <svg className="w-5 h-5 text-gold-600 transform scale-x-[-1]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9.5 6 6 8 3 9C6 11 8.5 13 10 17C11.5 13 14 11 17 9C14 8 10.5 6 12 2Z" fill="#BFA36D"/>
          <path d="M12 22C14.5 18 18 16 21 15C18 13 15.5 11 14 7C12.5 11 10 13 7 15C10 16 13.5 18 12 22Z" fill="#16382C"/>
        </svg>
      </div>

      <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent via-gold-400 to-gold-500"></div>
    </div>
  );
}
