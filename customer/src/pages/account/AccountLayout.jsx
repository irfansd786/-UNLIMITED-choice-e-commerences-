import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Settings } from 'lucide-react';

export default function AccountLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* 2-Column Account Layout (Pic 6 Composition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white p-3.5 rounded-xl border border-cream-300 shadow-xs space-y-1 text-xs">
          <div className="p-3 mb-2 rounded-lg bg-cream-50 border border-cream-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest-900 text-gold-300 font-serif font-bold flex items-center justify-center text-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-forest-950 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-charcoal-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <NavLink
            to="/account/profile"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors ${
                isActive ? 'bg-forest-900 text-gold-300' : 'text-charcoal-800 hover:bg-cream-100'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <User className="w-3.5 h-3.5" />
              <span>Profile & Overview</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </NavLink>

          <NavLink
            to="/account/orders"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors ${
                isActive ? 'bg-forest-900 text-gold-300' : 'text-charcoal-800 hover:bg-cream-100'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </NavLink>

          <NavLink
            to="/wishlist"
            className="flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-charcoal-800 hover:bg-cream-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-3.5 h-3.5" />
              <span>Wishlist</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </NavLink>

          <NavLink
            to="/account/addresses"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors ${
                isActive ? 'bg-forest-900 text-gold-300' : 'text-charcoal-800 hover:bg-cream-100'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Addresses</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </NavLink>

          <div className="pt-2 border-t border-cream-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Nested Content */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
