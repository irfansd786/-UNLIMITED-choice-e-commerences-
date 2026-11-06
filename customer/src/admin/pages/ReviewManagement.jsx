import React, { useState, useEffect } from 'react';
import { adminReviewService } from '../services/api';
import { Star, Check, X, Trash2, ShieldCheck } from 'lucide-react';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await adminReviewService.getAll();
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id, statusVal) => {
    try {
      await adminReviewService.updateStatus(id, statusVal);
      loadReviews();
    } catch (err) {
      alert(err.message || 'Error updating review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await adminReviewService.delete(id);
      loadReviews();
    } catch (err) {
      alert(err.message || 'Error deleting review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Customer Reviews & Moderation</h1>
          <p className="text-xs text-[#727A74] mt-1">Audit and moderate verified customer reviews and star ratings</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7EBE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] text-[#727A74] uppercase tracking-wider text-[10px] border-b border-[#E7EBE7]">
                <th className="p-3.5 font-semibold">Reviewer</th>
                <th className="p-3.5 font-semibold">Product ID</th>
                <th className="p-3.5 font-semibold">Rating</th>
                <th className="p-3.5 font-semibold">Feedback</th>
                <th className="p-3.5 font-semibold">Verification</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBE7]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#727A74]">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                  <td className="p-3.5 font-semibold text-[#252A27]">{r.user_name || "Customer"}</td>
                  <td className="p-3.5 font-mono text-[#727A74]">#{r.product_id}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-[#C5A16E] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#C5A16E]" />
                      <span>{r.rating} / 5</span>
                    </div>
                  </td>
                  <td className="p-3.5 max-w-sm">
                    {r.title && <div className="font-semibold text-[#252A27] mb-0.5">{r.title}</div>}
                    <p className="text-[#727A74] line-clamp-2 leading-relaxed">{r.comment}</p>
                  </td>
                  <td className="p-3.5">
                    {r.is_verified_purchase ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]">
                        Verified Purchase
                      </span>
                    ) : (
                      <span className="text-[#9DA5A0] text-[10px]">Unverified</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      r.status === 'APPROVED' 
                        ? 'bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                          className="p-1.5 rounded-lg bg-[#EBF5F0] text-[#173D30] hover:bg-[#D5E6DF] border border-[#D5E6DF] transition-colors"
                          title="Approve Review"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                          className="p-1.5 rounded-lg bg-[#F7F8F6] text-[#727A74] hover:text-[#252A27] border border-[#E7EBE7] transition-colors"
                          title="Reject Review"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg text-[#727A74] hover:text-red-600 hover:bg-red-50 border border-[#E7EBE7] transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#727A74]">
                    No customer reviews submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
