import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isLoading } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@varshienterprises.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex items-center justify-center p-4 font-sans text-[#252A27]">
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E7EBE7] max-w-md w-full space-y-6 shadow-luxury-md">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-[#C5A16E]/40 bg-[#FAF6F0] mx-auto shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="Varshi Enterprises" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#173D30] tracking-tight pt-1">VARSHI ENTERPRISES</h1>
          <p className="text-xs text-[#727A74]">Administrative Operations Console</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleFillDemoAdmin}
          className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/30 text-xs text-[#173D30] font-semibold hover:bg-[#F3EAD9]/60 transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-[#C5A16E]" />
          <span>Click to Fill Demo Admin Credentials</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#252A27] mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@varshienterprises.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#252A27] focus:outline-none focus:border-[#173D30] transition-colors"
              />
              <Mail className="w-4 h-4 text-[#727A74] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#252A27] mb-1">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#252A27] focus:outline-none focus:border-[#173D30] transition-colors"
              />
              <Lock className="w-4 h-4 text-[#727A74] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {isLoading ? "Verifying Credentials..." : "Enter Admin Portal"} 
            <ArrowRight className="w-4 h-4 text-[#C5A16E]" />
          </button>
        </form>

        <div className="text-center text-[11px] text-[#727A74] border-t border-[#E7EBE7] pt-4">
          Restricted System: Authorized administrative personnel only.
        </div>
      </div>
    </div>
  );
}
