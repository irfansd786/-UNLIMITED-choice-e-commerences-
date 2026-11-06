import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ChevronRight, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { orderService } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function OrderPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [trackNumber, setTrackNumber] = useState('');
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (isAuthenticated) {
        try {
          const data = await orderService.getAll();
          setOrders(data || []);
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const trimmed = trackNumber.trim();
    if (!trimmed) {
      setTrackError('Please enter a valid order number');
      return;
    }
    setTrackError('');
    navigate(`/order-confirmation/${encodeURIComponent(trimmed)}`);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PROCESSING') return ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.status);
    if (activeTab === 'SHIPPED') return ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status);
    if (activeTab === 'DELIVERED') return order.status === 'DELIVERED';
    if (activeTab === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300"><AlertCircle className="w-3 h-3" /> Cancelled</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"><Truck className="w-3 h-3" /> Shipped</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3 h-3" /> Processing</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="text-left space-y-2 border-b border-cream-300 pb-5">
          <div className="flex items-center gap-2 text-xs text-charcoal-500 font-medium">
            <Link to="/" className="hover:text-forest-900">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-forest-900 font-bold">Orders & Tracking</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
                Order Management & Live Tracking
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
                Track live physical deliveries, view order history, and access invoices.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-900 hover:bg-forest-950 text-gold-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" /> View Collection
            </Link>
          </div>
        </div>

        {/* Quick Order Lookup Form */}
        <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-xs">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">Instant Tracking</span>
            <h2 className="font-serif text-lg font-bold text-forest-950 mt-0.5">Track Any Order by ID</h2>
            <p className="text-xs text-charcoal-600 mt-1">
              Have an order reference (e.g., <code>ORD-2026-XXXX</code>)? Enter it below to check verified warehouse status:
            </p>
            <form onSubmit={handleTrackSubmit} className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter Order Number (e.g. ORD-2026-0001)"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-forest-700"
                />
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Track Now
              </button>
            </form>
            {trackError && <p className="text-xs text-red-600 mt-1.5">{trackError}</p>}
          </div>
        </div>

        {/* Orders Listing Section */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-forest-950">Your Order History</h2>
              <p className="text-xs text-charcoal-500">
                {isAuthenticated ? `${orders.length} orders recorded in your account` : 'Sign in to access your complete purchase history'}
              </p>
            </div>

            {/* Filter Tabs */}
            {isAuthenticated && orders.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-forest-900 text-gold-300 shadow-xs'
                        : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                    }`}
                  >
                    {tab.toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-20 bg-cream-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-cream-100 text-forest-900 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-forest-950">Please sign in to view your account orders</h3>
                <p className="text-xs text-charcoal-600 max-w-md mx-auto">
                  Sign in with your verified customer account to see your real-time order history, tracking details, and digital receipts.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/login?redirect=/orders"
                  className="px-6 py-2.5 bg-forest-900 hover:bg-forest-950 text-gold-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/products"
                  className="px-6 py-2.5 bg-cream-200 hover:bg-cream-300 text-charcoal-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  View Collection
                </Link>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-cream-100 text-forest-900 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-forest-950">No orders found</h3>
                <p className="text-xs text-charcoal-600">
                  {activeTab === 'ALL'
                    ? "You haven't placed any orders yet. Discover our heavyweight hoodies, graphic tees, and sneakers!"
                    : `No orders matching status filter "${activeTab.toLowerCase()}".`}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest-900 hover:bg-forest-950 text-gold-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
                >
                  Explore Streetwear Collections <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-cream-200">
              {filteredOrders.map((order) => {
                const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const firstItem = order.items?.[0];
                const img = firstItem?.product_image || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';

                return (
                  <div key={order.id} className="py-4 sm:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-cream-100 border border-cream-300 flex-shrink-0">
                        <img src={img} alt={firstItem?.product_name || 'Product'} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-forest-950">{order.order_number}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-1">
                          {firstItem?.product_name || 'Handcrafted Order Item'}
                          {order.items?.length > 1 && <span className="text-charcoal-500 font-normal"> +{order.items.length - 1} more items</span>}
                        </h4>
                        <p className="text-[11px] text-charcoal-500">
                          Placed on {dateStr} • {order.payment_method || 'Online'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-cream-100">
                      <div className="text-left md:text-right">
                        <div className="font-serif text-base font-bold text-forest-950">
                          ₹{Math.round(order.total_amount).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium">Free Express Delivery</span>
                      </div>
                      <Link
                        to={`/account/orders/${order.order_number}`}
                        className="px-4 py-2 bg-cream-100 hover:bg-forest-900 hover:text-gold-300 text-charcoal-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-xs"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quality Guarantee Banner */}
        <div className="bg-[#0B1E17] text-cream-100 p-5 rounded-2xl border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-gold-400 flex-shrink-0" />
            <div>
              <h4 className="font-serif text-sm font-bold text-gold-300">Live Physically Verified Deliveries</h4>
              <p className="text-xs text-cream-200">Zero artificial timers. Track authentic packages dispatched from Bengaluru warehouse.</p>
            </div>
          </div>
          <Link
            to="/products"
            className="px-5 py-2 bg-gold-600 hover:bg-gold-500 text-forest-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors whitespace-nowrap"
          >
            Order More Items
          </Link>
        </div>

      </div>
    </div>
  );
}
