import React, { useState } from 'react';
import { Search, ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({ 'orders-0': true });

  const sections = [
    {
      title: "Orders & Shipping",
      items: [
        {
          q: "How can I track my order?",
          a: "You can track your order in real-time under 'My Orders' in your Account dashboard. Once dispatched, tracking details with courier partner information are updated automatically."
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, you can cancel any order directly from your 'My Orders' page before it has been shipped. Any deducted live inventory will be instantly restored."
        },
        {
          q: "What should I do if my order is delayed?",
          a: "If your delivery timeline exceeds the estimated date shown at checkout, please contact our priority care team at care@unlimitedchoice.com or WhatsApp support."
        }
      ]
    },
    {
      title: "Returns & Exchanges",
      items: [
        {
          q: "What is your return policy?",
          a: "We offer a 7-day hassle-free return and exchange policy from the date of delivery for all unworn products with original brand tags and packaging intact."
        },
        {
          q: "How do I return an item?",
          a: "Navigate to 'My Orders' > 'Order Details' and click 'Request Return'. Our logistics partner will schedule a convenient doorstep pickup."
        }
      ]
    },
    {
      title: "Payments & Security",
      items: [
        {
          q: "Which payment methods do you accept?",
          a: "We accept UPI (Google Pay, PhonePe, Paytm), Visa, MasterCard, RuPay debit/credit cards, NetBanking across major Indian banks, and Cash on Delivery (COD)."
        },
        {
          q: "Is my payment secure?",
          a: "All online transactions are encrypted using 256-bit bank-grade SSL security. We never store your card numbers or UPI PINs."
        }
      ]
    }
  ];

  const toggleItem = (key) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredSections = sections.map(sec => ({
    ...sec,
    items: sec.items.filter(it => 
      !searchQuery.trim() || 
      it.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      it.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(sec => sec.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header & Search Bar (Pic 6 Composition) */}
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-3 text-center sm:text-left">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">Help & FAQ</h1>
          <p className="text-xs text-charcoal-600 mt-0.5">Find answers to common questions about orders, authentic handloom weaves, and shipping</p>
        </div>

        {/* Search input (Pic 6) */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-lg pl-9 pr-4 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-forest-700"
          />
          <Search className="w-3.5 h-3.5 text-forest-800 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Accordion Sections (Pic 6) */}
      <div className="space-y-4">
        {filteredSections.map((section, sIdx) => (
          <div key={sIdx} className="bg-white p-4 sm:p-5 rounded-xl border border-cream-300 shadow-xs space-y-2">
            <h2 className="font-serif text-sm font-bold text-forest-950 border-b border-cream-200 pb-2">
              {section.title}
            </h2>

            <div className="divide-y divide-cream-100 text-xs">
              {section.items.map((item, iIdx) => {
                const key = `${sIdx}-${iIdx}`;
                const isOpen = !!openItems[key];

                return (
                  <div key={iIdx} className="py-2.5 first:pt-1 last:pb-1">
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between text-left font-semibold text-charcoal-900 hover:text-forest-900 group"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-forest-800 transition-transform ${isOpen ? 'rotate-180 text-gold-700' : ''}`} />
                    </button>
                    {isOpen && (
                      <p className="text-charcoal-600 mt-1.5 leading-relaxed pt-1 border-t border-cream-100">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-forest-900 text-cream-50 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <p className="font-bold text-gold-300">Still have questions?</p>
          <p className="text-[11px] text-cream-200">Our customer care team in Bengaluru is ready to assist you.</p>
        </div>
        <Link
          to="/contact"
          className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs uppercase tracking-wider"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
