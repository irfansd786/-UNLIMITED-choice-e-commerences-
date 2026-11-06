import React from 'react';

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 text-xs">
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">Customer Assurance</span>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">Return & Exchange Policy</h1>
        <p className="text-[11px] text-charcoal-500">Last updated: October 2026 • UNLIMITED choice</p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-cream-300 shadow-xs space-y-4 leading-relaxed text-charcoal-700">
        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">1. Eligibility for Returns</h2>
          <p>
            We accept return requests within <strong>7 days</strong> from the date of confirmed delivery. Items must be unworn, unwashed, unaltered, and returned in their original packaging with all authentic security tags attached.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">2. Non-Returnable Items</h2>
          <p>
            Altered garments, worn footwear showing exterior sole wear, intimate apparel/socks removed from original sealed packaging, and personalized accessories cannot be returned unless they arrive damaged or defective.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">3. How to Initiate a Return</h2>
          <p>
            Visit <strong>My Account &gt; My Orders</strong>, locate the delivered item, and select <strong>Request Return</strong>. Once approved, our courier partner will coordinate a doorstep pickup from your address.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">4. Refund Timeline</h2>
          <p>
            Refunds are initiated within 48 hours of physical inspection at our central Bengaluru warehouse and credited back to your original payment method within 3-5 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
