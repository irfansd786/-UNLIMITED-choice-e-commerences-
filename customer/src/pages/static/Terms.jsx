import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 text-xs">
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">Legal Agreement</span>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">Terms & Conditions</h1>
        <p className="text-[11px] text-charcoal-500">Last updated: October 2026 • UNLIMITED choice</p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-cream-300 shadow-xs space-y-4 leading-relaxed text-charcoal-700">
        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">1. Orders & Live Stock Verification</h2>
          <p>
            By placing an order on UNLIMITED choice, you agree that your order constitutes an offer to purchase authentic goods. Inventory counters reflect real physical stock in Bengaluru and are allocated in real time.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">2. Pricing & Currency</h2>
          <p>
            All prices are listed in Indian Rupees (₹ INR) and include applicable taxes. Orders above ₹999 qualify for Free Express Shipping across all supported Indian PIN codes.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">3. Fabric & Production Authenticity</h2>
          <p>
            Because our apparel utilizes specialized mineral washes, natural dyes, and custom-milled heavyweight yarns, subtle nuances in wash fade and vintage patina are natural characteristics of premium streetwear production.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">4. Limitation of Liability</h2>
          <p>
            UNLIMITED choice shall not be liable for indirect or consequential damages arising out of shipping delays caused by force majeure or courier logistics constraints.
          </p>
        </section>
      </div>
    </div>
  );
}
