import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import BrandLogo from '../components/common/BrandLogo';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
      });
      try {
        await useCartStore.getState().syncGuestCartToServer();
      } catch (e) {}
      addToast('Account created successfully! Welcome to UNLIMITED choice.', 'success');
      navigate(redirect);
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-soft max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo />
          <h2 className="font-serif text-2xl font-bold text-forest-950 pt-2">Create Your Account</h2>
          <p className="text-xs text-charcoal-500">Join UNLIMITED choice for verified shopping & express tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-forest-800"
              />
              <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-forest-800"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Mobile Phone (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-forest-800"
              />
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Create Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-forest-800"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Register Now"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-600 pt-2 border-t border-cream-100">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-forest-900 hover:text-gold-600">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
