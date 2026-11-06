import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../../components/common/BrandLogo';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-cream-300 shadow-xs space-y-4">
        {/* Unlimited Choice Emblem */}
        <img src="/logo.png" alt="UNLIMITED choice" className="h-16 w-auto mx-auto object-contain block drop-shadow-xs" />

        <div className="space-y-1">
          <span className="font-serif text-5xl font-bold text-forest-950 block">404</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">Page Not Found</h1>
          <p className="text-xs text-charcoal-600 leading-relaxed max-w-xs mx-auto pt-1">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            Back to Home
          </Link>
          <Link
            to="/products"
            className="px-6 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-forest-950 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
