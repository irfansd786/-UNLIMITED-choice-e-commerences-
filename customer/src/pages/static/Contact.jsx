import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export default function Contact() {
  const { addToast } = useToastStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Thank you! Your message has been sent to our customer care team.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Get in Touch</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">Customer Care & Support</h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl mx-auto">
          We are here to assist with sizing inquiries, streetwear drops, order tracking, returns, or product care.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-forest-950 text-cream-100 p-8 rounded-3xl border border-gold-500/30 space-y-6 shadow-xl">
          <h3 className="font-serif text-xl font-bold text-white">Contact Information</h3>

          <div className="space-y-4 text-xs text-cream-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">UNLIMITED choice Head Office</strong>
                Unlimited Choice Commercial Hub, MG Road, Bengaluru, Karnataka - 560001
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Phone Support</strong>
                +91 93468 53657 (Mon - Sat, 9:00 AM - 7:00 PM IST)
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Email Care</strong>
                care@unlimitedchoice.com
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Dispatch Hours</strong>
                Orders placed before 2:00 PM are dispatched on the same business day.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-cream-200 shadow-soft">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-forest-700 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-forest-950">Message Received</h3>
              <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
                Thank you, {formData.name}. Our customer care team will review your message and reply via email within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                className="px-6 py-2.5 rounded-full bg-forest-900 text-gold-300 text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Order Inquiry / Weave Details"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-xs text-charcoal-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-forest-900 text-gold-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-forest-800 transition-colors shadow-soft"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
