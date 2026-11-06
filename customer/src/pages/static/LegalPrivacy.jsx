import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function LegalPrivacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 text-xs">
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">Legal Policy</span>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">Privacy Policy</h1>
        <p className="text-[11px] text-charcoal-500">Last updated: October 2026 • UNLIMITED choice</p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-cream-300 shadow-xs space-y-4 leading-relaxed text-charcoal-700">
        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">1. Information We Collect</h2>
          <p>
            When you visit or make a purchase from UNLIMITED choice, we collect personal information such as your name, delivery address, email address, phone number, and billing details necessary to fulfill your handcrafted orders.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">2. How We Use Your Information</h2>
          <p>
            We use your data exclusively to process orders, facilitate doorstep delivery across India, manage live inventory reservations, communicate delivery updates, and provide customer care assistance.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">3. Data Security & Encryption</h2>
          <p>
            All customer credentials and payment communications utilize 256-bit SSL encryption. We never sell, rent, or distribute personal information to third-party marketing brokers.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-forest-950">4. Contacting Our Data Privacy Team</h2>
          <p>
            For questions regarding your saved profile or order history data, email us at <strong className="text-forest-950">care@unlimitedchoice.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
