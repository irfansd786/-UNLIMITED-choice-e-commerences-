import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { orderService, addressService } from '../../services/api';
import { User, Mail, Phone, Lock, Save, Package, Heart, CreditCard, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { wishlist, fetchWishlist } = useWishlistStore();
  const { addToast } = useToastStore();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Edit Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function loadAccountOverview() {
      try {
        const [ordData, addrData] = await Promise.all([
          orderService.getAll().catch(() => []),
          addressService.getAll().catch(() => []),
        ]);
        setOrders(ordData);
        setAddresses(addrData);
        fetchWishlist();
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadAccountOverview();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const wishlistItemCount = wishlist?.items?.length || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        password: password || undefined,
      });
      setPassword('');
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. WELCOME HEADER (Pic 6 Composition) */}
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
            Welcome, {user?.full_name}
          </h1>
          <p className="text-xs text-charcoal-500">{user?.email}</p>
        </div>

        {/* 3 Summary Stat Cards (Pic 6) */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-[10px] font-bold text-charcoal-500 uppercase block">Total Orders</span>
            <span className="text-lg sm:text-xl font-bold text-forest-950 mt-0.5 block">{orders.length}</span>
          </div>

          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-[10px] font-bold text-charcoal-500 uppercase block">Wishlist Items</span>
            <span className="text-lg sm:text-xl font-bold text-forest-950 mt-0.5 block">{wishlistItemCount}</span>
          </div>

          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-[10px] font-bold text-charcoal-500 uppercase block">Total Spent</span>
            <span className="text-lg sm:text-xl font-bold text-forest-950 mt-0.5 block">
              ₹{Math.round(totalSpent).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. RECENT ORDERS TABLE / LIST (Pic 6 Composition) */}
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cream-200">
          <h2 className="font-serif text-base font-bold text-forest-950">Recent Orders</h2>
          <Link to="/account/orders" className="text-xs font-semibold text-forest-900 hover:text-gold-700">
            View All →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-charcoal-500 py-4 text-center">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-cream-100 text-xs">
            {orders.slice(0, 4).map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const firstItem = order.items?.[0];
              const img = firstItem?.product_image || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';

              return (
                <div key={order.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={img} alt="" className="w-10 h-12 rounded object-cover flex-shrink-0 bg-cream-100" />
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-forest-950">{order.order_number}</span>
                      <p className="text-[10px] text-charcoal-500">{dateStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-forest-950">₹{Math.round(order.total_amount).toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                    <Link
                      to={`/account/orders/${order.order_number}`}
                      className="text-forest-900 hover:text-gold-700 font-semibold text-[11px]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PROFILE SETTINGS */}
      <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-3">
        <h2 className="font-serif text-base font-bold text-forest-950 pb-2 border-b border-cream-200">
          Personal Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Update Password (Optional)</label>
            <input
              type="password"
              placeholder="Leave blank to keep unchanged"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-900"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
