import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminOrderService } from '../services/api';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

export default function OrderManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await adminOrderService.getAll({
        status_filter: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setOrders(data || []);
      if (initialSearch && data && data.length > 0) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const updated = await adminOrderService.updateStatus(selectedOrder.id, newStatus, statusNote);
      setSelectedOrder(updated);
      setStatusNote('');
      loadOrders();
      alert(`Order ${updated.order_number} status updated to ${newStatus}`);
    } catch (err) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusOptions = [
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Order Fulfillment & Logistics</h1>
          <p className="text-xs text-[#727A74] mt-1">Review live checkouts, inspect shipping addresses, and manage status transitions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7EBE7] shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="Search by order number (e.g. VE-...) or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#252A27] placeholder:text-[#9DA5A0] focus:outline-none focus:border-[#173D30]"
          />
          <Search className="w-4 h-4 text-[#727A74] absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl px-3 py-2 text-xs text-[#252A27] focus:outline-none focus:border-[#173D30]"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
          </select>
          <span className="text-xs text-[#727A74] whitespace-nowrap">
            {orders.length} orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E7EBE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] text-[#727A74] uppercase tracking-wider text-[10px] border-b border-[#E7EBE7]">
                <th className="p-3.5 font-semibold">Order #</th>
                <th className="p-3.5 font-semibold">Date & Time</th>
                <th className="p-3.5 font-semibold">Customer</th>
                <th className="p-3.5 font-semibold">Items</th>
                <th className="p-3.5 font-semibold">Total (INR)</th>
                <th className="p-3.5 font-semibold">Payment</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBE7]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#727A74]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-[#173D30]">{o.order_number}</td>
                  <td className="p-3.5 text-[#727A74]">
                    {new Date(o.created_at).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="p-3.5 font-medium text-[#252A27]">{o.shipping_address?.full_name || "Customer"}</td>
                  <td className="p-3.5 text-[#727A74]">{o.items?.reduce((s, it) => s + it.quantity, 0) || 0} pcs</td>
                  <td className="p-3.5 font-bold text-[#173D30]">₹{Math.round(o.total_amount).toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-[#727A74]">
                    <span className="font-semibold">{o.payment?.payment_method || "COD"}</span>
                    <span className="text-[10px] text-[#9DA5A0] ml-1">({o.payment?.status || 'PENDING'})</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }}
                      className="px-3 py-1.5 rounded-lg bg-[#F7F8F6] hover:bg-[#FAF6F0] text-[#173D30] border border-[#E7EBE7] font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C5A16E]" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#727A74]">
                    No orders found matching this search or status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full p-6 sm:p-7 overflow-y-auto space-y-5 border-l border-[#E7EBE7] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBE7]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A16E]">Order Inspection</span>
                <h2 className="font-serif text-xl font-bold text-[#173D30] font-mono">{selectedOrder.order_number}</h2>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-1.5 rounded-lg text-[#727A74] hover:text-[#252A27] hover:bg-[#F7F8F6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatusSubmit} className="p-4 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/30 space-y-3 text-xs">
              <h3 className="font-bold text-[#173D30] uppercase text-[11px]">Update Operational Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="bg-white border border-[#E7EBE7] rounded-xl p-2 text-[#252A27] font-semibold focus:outline-none focus:border-[#173D30]"
                >
                  {statusOptions.map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Optional log note (e.g. Courier Dispatched)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="bg-white border border-[#E7EBE7] rounded-xl p-2 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                />
              </div>
              <button
                type="submit"
                disabled={updatingStatus || newStatus === selectedOrder.status}
                className="w-full py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-semibold text-xs disabled:opacity-50 transition-colors shadow-xs"
              >
                {updatingStatus ? "Updating..." : "Confirm Status Update"}
              </button>
            </form>

            {/* Ordered Items List */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-[#173D30] uppercase text-[11px]">Ordered Line Items</h3>
              <div className="divide-y divide-[#E7EBE7] bg-[#F7F8F6] p-4 rounded-xl border border-[#E7EBE7] space-y-2">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {it.product_image && (
                        <img 
                          src={it.product_image} 
                          alt="" 
                          className="w-10 aspect-[3/4] rounded-lg object-cover border border-[#E7EBE7] bg-white" 
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-[#252A27]">{it.product_name}</h4>
                        <p className="text-[10px] text-[#727A74]">SKU: {it.product_sku} • Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#173D30]">₹{Math.round(it.total_price).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] space-y-1.5">
                <span className="font-bold text-[#C5A16E] uppercase text-[10px] block">Shipping Address</span>
                <p className="text-[#252A27] leading-relaxed">
                  <strong className="text-[#173D30]">{selectedOrder.shipping_address?.full_name}</strong><br />
                  Phone: {selectedOrder.shipping_address?.phone || "Not specified"}<br />
                  {selectedOrder.shipping_address?.address_line1}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.postal_code}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] space-y-1.5">
                <span className="font-bold text-[#C5A16E] uppercase text-[10px] block">Payment Verification</span>
                <p className="text-[#252A27] leading-relaxed">
                  Method: <strong className="text-[#173D30]">{selectedOrder.payment?.payment_method || "Online"}</strong><br />
                  Status: <strong className="text-emerald-700">{selectedOrder.payment?.status}</strong><br />
                  Ref: <span className="font-mono text-[10px] text-[#727A74]">{selectedOrder.payment?.transaction_reference || "N/A"}</span><br />
                  Grand Total: <strong className="text-[#173D30]">₹{Math.round(selectedOrder.total_amount).toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
