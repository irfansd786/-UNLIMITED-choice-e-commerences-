import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Check, ThumbsUp, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export default function Reviews() {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: "Aarav Sharma",
      verified: true,
      rating: 5,
      date: "May 12, 2026",
      title: "Unmatched fabric weight and structured drape",
      comment: "The 450GSM loopback cotton fleece is insane. Double-layer hood that doesn't collapse, boxy drop-shoulder cut that fits like high-end designer streetwear. Highly recommended.",
      product_name: "Heavyweight 450GSM Oversized Pullover Hoodie",
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80"
      ]
    },
    {
      id: 2,
      author: "Rohan Mehta",
      verified: true,
      rating: 5,
      date: "May 08, 2026",
      title: "High-density puff print looks pristine",
      comment: "Tight collar ribbing that doesn't stretch or sag after machine washing. The screenprint details are crisp and the 260GSM cotton feels substantial.",
      product_name: "Cyber Tokyo Typographic Graphic Street Tee",
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80"
      ]
    },
    {
      id: 3,
      author: "Vikram Nair",
      verified: true,
      rating: 5,
      date: "May 03, 2026",
      title: "Supple full-grain leather & cushioned cupsole",
      comment: "The forest green accents with vintage white leather look clean when paired with wide-leg denim and relaxed joggers. The memory foam insole makes them all-day comfortable.",
      product_name: "Apex Retro Leather Court Sneakers",
      images: [
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80"
      ]
    }
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title (Pic 6 Composition) */}
      <div className="border-b border-cream-300 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">Customer Reviews</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">Real verified purchase feedback</p>
        </div>
        <Link
          to="/products"
          className="px-4 py-2 rounded-lg bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Write a Review
        </Link>
      </div>

      {/* Ratings Overview Bar (Pic 6) */}
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Rating Score */}
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-forest-950">4.7</span>
              <span className="text-xs text-charcoal-500">out of 5</span>
            </div>
            <div className="flex justify-center md:justify-start text-gold-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-gold-500 text-gold-500" />
              ))}
            </div>
            <p className="text-xs text-charcoal-500 pt-0.5">Based on 208 verified customer reviews</p>
          </div>

          {/* Rating Distribution Progress Bars (Pic 6) */}
          <div className="md:col-span-8 space-y-1.5 text-xs">
            {[
              { star: 5, pct: 78 },
              { star: 4, pct: 15 },
              { star: 3, pct: 4 },
              { star: 2, pct: 2 },
              { star: 1, pct: 1 },
            ].map((row) => (
              <div key={row.star} className="flex items-center gap-2 text-charcoal-700">
                <span className="w-6 font-semibold">{row.star} ★</span>
                <div className="flex-1 bg-cream-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-forest-900 h-full rounded-full" style={{ width: `${row.pct}%` }}></div>
                </div>
                <span className="w-8 text-right font-medium text-charcoal-500">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cards List (Pic 6) */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white p-4 sm:p-5 rounded-xl border border-cream-300 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-forest-950">{rev.author}</span>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Check className="w-2.5 h-2.5 text-emerald-600" /> Verified Purchase
                  </span>
                )}
              </div>
              <span className="text-[11px] text-charcoal-400">{rev.date}</span>
            </div>

            <div className="flex text-gold-500">
              {[1, 2, 3, 4, 5].map((st) => (
                <Star key={st} className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-gold-500 text-gold-500' : 'text-cream-300'}`} />
              ))}
            </div>

            {rev.title && <h3 className="font-bold text-charcoal-900 text-xs">{rev.title}</h3>}
            <p className="text-charcoal-700 leading-relaxed">{rev.comment}</p>

            {/* Uploaded Customer Photos (Pic 6) */}
            {rev.images?.length > 0 && (
              <div className="flex gap-2 pt-1">
                {rev.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-cream-200" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
