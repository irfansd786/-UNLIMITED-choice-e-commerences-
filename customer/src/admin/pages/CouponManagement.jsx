import React, { useState, useEffect } from 'react';
import { adminCouponService } from '../services/api';
import { Ticket, Plus, Trash2, Edit, Check, X } from 'lucide-react';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_order_value: 999,
    max_discount_amount: 500,
    usage_limit: 500,
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await adminCouponService.getAll();
      setCoupons(data || []);
    } catch (err) {
      console.error("Failed to load coupons", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value),
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit, 10) : null,
      };
      await adminCouponService.create(payload);
      setShowModal(false);
      setFormData({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        min_order_value: 999,
        max_discount_amount: 500,
        usage_limit: 500,
        is_active: true,
      });
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Error creating coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon code?")) return;
    try {
      await adminCouponService.delete(id);
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Error deleting coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Promotional Discount Coupons</h1>
          <p className="text-xs text-[#727A74] mt-1">Configure backend-validated promotional discount codes and order eligibility rules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C5A16E]" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3].map(n => (
            <div key={n} className="h-60 bg-white border border-[#E7EBE7] rounded-2xl animate-pulse"></div>
          ))
        ) : coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[#E7EBE7] p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#C5A16E]/60 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#173D30] bg-[#FAF6F0] px-3 py-1 rounded-xl border border-[#C5A16E]/40 tracking-wider">
                  {c.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  c.is_active ? 'bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]' : 'bg-stone-100 text-stone-600'
                }`}>
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#252A27]">
                  {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                </h4>
                <p className="text-xs text-[#727A74] mt-1 leading-relaxed">{c.description || "Promotional coupon"}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-xs space-y-1.5 text-[#252A27]">
                <div className="flex justify-between">
                  <span className="text-[#727A74]">Min Order:</span>
                  <span className="font-semibold text-[#173D30]">₹{c.min_order_value}</span>
                </div>
                {c.max_discount_amount && (
                  <div className="flex justify-between">
                    <span className="text-[#727A74]">Max Discount:</span>
                    <span className="font-semibold text-[#173D30]">₹{c.max_discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#727A74]">Redeemed:</span>
                  <span className="font-semibold text-emerald-700">{c.times_used || 0} times</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7EBE7] flex items-center justify-end">
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
        {!loading && coupons.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-[#E7EBE7] p-8 text-center text-xs text-[#727A74]">
            No coupons configured yet. Click "Create Coupon" to add one.
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 border border-[#E7EBE7] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBE7]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#173D30]">Create Promo Coupon</h3>
                <p className="text-xs text-[#727A74]">Set code, percentage or flat discount, and order caps</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-[#727A74] hover:text-[#252A27] hover:bg-[#F7F8F6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#173D30] font-mono uppercase font-bold focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="10 or 500"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] font-semibold focus:outline-none focus:border-[#173D30]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10% discount on orders above ₹999"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-[#E7EBE7]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E7EBE7] text-[#727A74] font-semibold hover:bg-[#F7F8F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-semibold transition-colors shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
