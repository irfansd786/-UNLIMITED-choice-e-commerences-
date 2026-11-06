import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RealStockBadge({ stock = 0, lowStockThreshold = 5, lastVerified = null, size = "md" }) {
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= lowStockThreshold;

  if (isOutOfStock) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        Currently Out of Stock
      </div>
    );
  }

  if (isLowStock) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Only <strong>{stock}</strong> units left in real stock</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-forest-50 text-forest-800 border border-forest-100 text-xs font-medium`}>
      <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
      <span>Real Stock Verified: <strong>{stock} available</strong></span>
    </div>
  );
}
