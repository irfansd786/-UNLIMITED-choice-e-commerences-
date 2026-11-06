import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import { Package, ChevronRight, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await orderService.getAll();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PROCESSING') return ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.status);
    if (activeFilter === 'SHIPPED') return ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status);
    if (activeFilter === 'DELIVERED') return order.status === 'DELIVERED';
    if (activeFilter === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded text-[11px] bg-red-50 text-red-700 border border-red-200 font-semibold">Cancelled</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-0.5 rounded text-[11px] bg-blue-50 text-blue-800 border border-blue-200 font-semibold">Shipped</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Processing</span>;
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-4">
      {/* Title & Status Tabs (Pic 6 Composition) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-forest-950">My Orders</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">{orders.length} total orders recorded</p>
        </div>

        {/* Status Filter Tabs (Pic 6) */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                activeFilter === tab
                  ? 'bg-forest-900 text-gold-300'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-16 bg-cream-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <p className="text-xs text-charcoal-600">No orders found matching this filter.</p>
          <Link to="/products" className="inline-block px-4 py-1.5 rounded-lg bg-forest-900 text-gold-300 text-xs font-bold">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-cream-100 text-xs">
          {filteredOrders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const firstItem = order.items?.[0];
            const img = firstItem?.product_image || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';

            return (
              <div key={order.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Order Thumbnail & Meta (Pic 6) */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img src={img} alt="" className="w-12 h-14 rounded object-cover flex-shrink-0 bg-cream-100 border border-cream-200" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-mono font-bold text-forest-950 block">{order.order_number}</span>
                    <p className="text-[11px] text-charcoal-500">{dateStr}</p>
                    <p className="text-[11px] text-charcoal-700 truncate">
                      {order.items?.map(it => `${it.product_name} (x${it.quantity})`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Amount, Status, Track Order & View Details */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                  <span className="font-bold text-forest-950 text-sm">
                    ₹{Math.round(order.total_amount).toLocaleString('en-IN')}
                  </span>
                  <div>{getStatusBadge(order.status)}</div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/account/orders/${order.order_number}?track=true`}
                      className="px-3.5 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
