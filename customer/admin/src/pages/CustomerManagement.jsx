import React, { useState, useEffect } from 'react';
import { adminCustomerService } from '../services/api';
import { Users, Mail, Phone, ShoppingBag, Search, ShieldCheck } from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await adminCustomerService.getAll();
        setCustomers(data || []);
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter(c =>
    !searchQuery || 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Registered Customers</h1>
          <p className="text-xs text-[#727A74] mt-1">Directory of customer profiles, purchase history, and lifetime spending</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E7EBE7] shadow-xs max-w-md relative">
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#252A27] placeholder:text-[#9DA5A0] focus:outline-none focus:border-[#173D30]"
        />
        <Search className="w-4 h-4 text-[#727A74] absolute left-7 top-1/2 -translate-y-1/2" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E7EBE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] text-[#727A74] uppercase tracking-wider text-[10px] border-b border-[#E7EBE7]">
                <th className="p-3.5 font-semibold">Customer</th>
                <th className="p-3.5 font-semibold">Contact Phone</th>
                <th className="p-3.5 font-semibold">Total Orders</th>
                <th className="p-3.5 font-semibold">Lifetime Spent</th>
                <th className="p-3.5 font-semibold">Joined Date</th>
                <th className="p-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBE7]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#727A74]">
                    Loading customer profiles...
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#173D30] text-[#C5A16E] border border-[#C5A16E]/30 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                        {c.full_name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#252A27] truncate">{c.full_name}</h4>
                        <span className="text-[11px] text-[#727A74]">{c.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#727A74]">{c.phone || "Not provided"}</td>
                  <td className="p-3.5 font-semibold text-[#252A27]">{c.total_orders} orders</td>
                  <td className="p-3.5 font-bold text-[#173D30]">₹{Math.round(c.total_spent || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-[#727A74]">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]">
                      Active Account
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#727A74]">
                    No customer profiles found.
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
