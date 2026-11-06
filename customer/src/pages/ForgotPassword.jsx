import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useToastStore } from '../store/useToastStore';
import BrandLogo from '../components/common/BrandLogo';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      addToast('Reset instructions generated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to process request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-soft max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo />
          <h2 className="font-serif text-2xl font-bold text-forest-950 pt-2">Password Recovery</h2>
          <p className="text-xs text-charcoal-500">Enter your registered email to reset your account password</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-950 space-y-3 text-center">
            <p className="font-semibold">Reset Instructions Dispatched</p>
            <p className="text-charcoal-600">If an account matches <strong>{email}</strong>, instructions to create a new password have been prepared.</p>
            <Link to="/login" className="inline-block px-4 py-2 rounded-xl bg-forest-900 text-gold-300 font-semibold text-xs mt-2">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-forest-800"
                />
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Send Reset Link"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-gold-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
