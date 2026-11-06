import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAdminAuthStore } from '../admin/store/useAdminAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import BrandLogo from '../components/common/BrandLogo';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, User, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login: customerLogin } = useAuthStore();
  const { login: adminLogin } = useAdminAuthStore();
  const { addToast } = useToastStore();

  const completeAdminLogin = (data) => {
    localStorage.setItem('varshi_admin_token', data.access_token);
    localStorage.setItem('varshi_admin_user', JSON.stringify(data.user));
    localStorage.setItem('varshi_customer_token', data.access_token);
    localStorage.setItem('varshi_customer_user', JSON.stringify(data.user));
    
    useAdminAuthStore.setState({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
    useAuthStore.setState({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const completeCustomerLogin = async (data) => {
    localStorage.setItem('varshi_customer_token', data.access_token);
    localStorage.setItem('varshi_customer_user', JSON.stringify(data.user));
    
    useAuthStore.setState({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
      isLoading: false,
    });

    try {
      await useCartStore.getState().syncGuestCartToServer();
    } catch (_) {}
  };

  // 1-Click: Click Demo Customer -> Auto fill & open customer store
  const handleDemoCustomer = async () => {
    const custEmail = 'customer@varshienterprises.com';
    const custPass = 'customer123';
    setEmail(custEmail);
    setPassword(custPass);
    setIsSubmitting(true);
    try {
      const data = await customerLogin(custEmail, custPass);
      await completeCustomerLogin(data);
      addToast('Signed in as Customer! Welcome to UNLIMITED choice.', 'success');
      navigate(redirect.startsWith('/admin') ? '/' : redirect);
    } catch (err) {
      addToast(err.message || 'Customer login failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click: Click Login as Admin -> Auto fill & open admin panel
  const handleDemoAdmin = async () => {
    const adminEmail = 'admin@varshienterprises.com';
    const adminPass = 'admin123';
    setEmail(adminEmail);
    setPassword(adminPass);
    setIsSubmitting(true);
    try {
      const data = await adminLogin(adminEmail, adminPass);
      completeAdminLogin(data);
      addToast('Signed in as Admin! Opening Admin Panel...', 'success');
      navigate('/admin');
    } catch (err) {
      addToast(err.message || 'Admin authentication failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form submit (manual typing)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    try {
      const data = await customerLogin(email.trim(), password);
      if (data.user?.role === 'ADMIN') {
        completeAdminLogin(data);
        addToast('Admin credentials verified. Opening Admin Panel...', 'success');
        navigate('/admin');
      } else {
        await completeCustomerLogin(data);
        addToast('Welcome back to UNLIMITED choice!', 'success');
        navigate(redirect.startsWith('/admin') ? '/' : redirect);
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-50/70">
      <div className="bg-white p-7 sm:p-10 rounded-3xl border border-neutral-200 shadow-soft max-w-md w-full space-y-6">
        
        {/* Header with New Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo className="h-16 sm:h-20" />
          </div>
          <h2 className="font-sans text-2xl font-black text-neutral-900 pt-1 tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-neutral-500">
            Welcome to UNLIMITED choice — Wear More • Choose Better
          </p>
        </div>

        {/* Super Clean Fast 1-Click Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDemoCustomer}
              className="py-3 px-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Demo Customer</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDemoAdmin}
              className="py-3 px-3 rounded-2xl bg-[#173D30] hover:bg-[#112F25] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#D7F58C]" />
              <span>Login as Admin</span>
            </button>
          </div>
          <p className="text-[11px] text-center text-neutral-400">
            Clicking automatically fills details below & opens the portal
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
            Or Sign In Manually
          </span>
          <div className="border-t border-neutral-200 w-full" />
        </div>

        {/* Form Inputs (Auto-filled upon clicking buttons above) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-800 mb-1">Email / ID</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter email or use buttons above"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-neutral-800">Password</label>
              <Link to="/forgot-password" className="text-neutral-600 hover:text-neutral-900 text-[11px] font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all font-medium"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-600 pt-2 border-t border-neutral-100">
          Don't have an account yet?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-neutral-900 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
