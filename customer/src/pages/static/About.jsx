import React from 'react';
import { ShieldCheck, Award, Heart, CheckCircle2, MapPin, Truck } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">The Unlimited Choice Story</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">
          Wear More • Choose Better
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
          Founded with a commitment to engineering premium men's fashion and urban streetwear, UNLIMITED choice delivers heavyweight apparel, precision tailoring, and authenticated footwear with zero compromise.
        </p>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-200 shadow-soft space-y-8">
        <div className="space-y-4 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
          <h2 className="font-serif text-2xl font-bold text-forest-950">Our Vision</h2>
          <p>
            In a digital market saturated with synthetic blends and inflated inventory counters, UNLIMITED choice was established on three non-negotiable principles: <strong>Heavyweight Fabric Integrity, Transparent Pricing in INR, and Real Physical Inventory</strong>.
          </p>
          <p>
            We partner directly with leading domestic textile mills and specialized footwear workshops in India. Every single piece displayed in our store—from 450GSM loopback fleece hoodies to full-grain calfskin leather court sneakers—is physically audited, fit-tested, and photographed in our Bengaluru warehouse before entering our live inventory system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-cream-100">
          <div className="p-4 rounded-2xl bg-cream-50 space-y-2">
            <ShieldCheck className="w-6 h-6 text-forest-800" />
            <h3 className="font-bold text-charcoal-900 text-xs">Direct Fabric & Mill Sourcing</h3>
            <p className="text-[11px] text-charcoal-600">Heavyweight 450GSM fleece, 260GSM combed cotton, and full-grain leather.</p>
          </div>
          <div className="p-4 rounded-2xl bg-cream-50 space-y-2">
            <Award className="w-6 h-6 text-forest-800" />
            <h3 className="font-bold text-charcoal-900 text-xs">Real Live Inventory</h3>
            <p className="text-[11px] text-charcoal-600">Exact physical warehouse stock counts with zero simulated scarcity.</p>
          </div>
          <div className="p-4 rounded-2xl bg-cream-50 space-y-2">
            <Truck className="w-6 h-6 text-forest-800" />
            <h3 className="font-bold text-charcoal-900 text-xs">Express Pan-India Logistics</h3>
            <p className="text-[11px] text-charcoal-600">Careful tamper-proof packaging and fast dispatch within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
