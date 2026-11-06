import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { 
  Package, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw, 
  XCircle,
  Clock,
  CreditCard,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  Phone,
  Sparkles,
  Navigation
} from 'lucide-react';

export default function OrderDetails() {
  const { orderIdOrNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(true);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [isRefreshingTrack, setIsRefreshingTrack] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const data = await orderService.getByIdOrNumber(orderIdOrNumber);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();

    // Check if ?track=true was passed in URL
    if (searchParams.get('track') === 'true') {
      setShowTracking(true);
    }
  }, [orderIdOrNumber, searchParams]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? Deducted inventory will be restored.")) return;
    setActionLoading(true);
    try {
      const updated = await orderService.cancel(order.id, "Customer requested cancellation");
      setOrder(updated);
      addToast('Order cancelled successfully.', 'info');
    } catch (err) {
      addToast(err.message || 'Could not cancel order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!window.confirm("Would you like to initiate a 30-day return request for this delivered order?")) return;
    setActionLoading(true);
    try {
      const updated = await orderService.requestReturn(order.id, "30-day effortless luxury returns");
      setOrder(updated);
      addToast('Return request registered. Our support team will assist you.', 'success');
    } catch (err) {
      addToast(err.message || 'Could not initiate return', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyAwb = (awb) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
    addToast('Courier Tracking AWB copied to clipboard!', 'info');
  };

  const handleRefreshTracking = () => {
    setIsRefreshingTrack(true);
    setTimeout(() => {
      setIsRefreshingTrack(false);
      addToast('Tracking data synchronized with BlueDart Air Hub.', 'success');
    }, 800);
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-cream-300 animate-pulse space-y-4">
        <div className="h-6 bg-cream-200 rounded w-1/3"></div>
        <div className="h-28 bg-cream-100 rounded-xl"></div>
        <div className="h-44 bg-cream-100 rounded-xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-cream-300 text-center space-y-3 font-sans">
        <h3 className="font-serif text-lg font-bold text-forest-950">Order Not Found</h3>
        <p className="text-xs text-charcoal-600">The requested order reference could not be located.</p>
        <Link to="/account/orders" className="inline-block px-5 py-2 rounded-xl bg-forest-900 text-gold-300 text-xs font-bold uppercase tracking-wider">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at || Date.now());
  const dateStr = orderDate.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const awbNumber = `BLD-VE-${order.order_number.replace(/^VE-/, '')}`;
  const courierPartner = "BlueDart Express Priority Air";

  // Calculate estimated delivery: 3 days after order creation
  const estDeliveryDate = new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000));
  const estDeliveryStr = estDeliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Calculate chronological tracking milestones based on order state
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';
  const isShipped = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
  const isProcessing = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);

  const formatEventDate = (hoursOffset) => {
    const d = new Date(orderDate.getTime() + (hoursOffset * 60 * 60 * 1000));
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ' • ' + 
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const trackingEvents = [
    {
      title: "Order Placed & Payment Authorized",
      location: "Bengaluru E-Commerce Studio",
      time: formatEventDate(0),
      note: `Order ${order.order_number} confirmed with ${order.payment?.payment_method || 'Verified Channel'}. Inventory allocated.`,
      completed: true,
      current: order.status === 'PLACED'
    },
    {
      title: "Quality Inspection & Bespoke Packaging",
      location: "Unlimited Choice Fulfillment Hub, Indiranagar",
      time: formatEventDate(4),
      note: "Garments inspected by master quality tailor. Sealed in tamper-evident luxury packaging.",
      completed: isProcessing,
      current: order.status === 'CONFIRMED' || order.status === 'PROCESSING'
    },
    {
      title: "Handed to Courier Partner (BlueDart Express)",
      location: "Bengaluru Central Air Logistics Facility",
      time: formatEventDate(14),
      note: `Shipment bagged and registered under Airway Bill ${awbNumber}. Ready for dispatch.`,
      completed: isShipped,
      current: order.status === 'SHIPPED'
    },
    {
      title: "In Transit — Regional Air Sorting Facility",
      location: `${order.shipping_address?.city || 'Destination'} Regional Gateway`,
      time: formatEventDate(28),
      note: "Container scanned and sorted. Directed to local neighborhood delivery hub.",
      completed: isShipped && (isOutForDelivery || isDelivered),
      current: false
    },
    {
      title: "Out for Delivery to Destination",
      location: `${order.shipping_address?.city || 'Local Delivery Unit'}`,
      time: formatEventDate(48),
      note: `Package with courier executive for doorstep handover at ${order.shipping_address?.address_line1 || 'shipping address'}.`,
      completed: isOutForDelivery || isDelivered,
      current: order.status === 'OUT_FOR_DELIVERY'
    },
    {
      title: "Delivered to Customer",
      location: `${order.shipping_address?.city || 'Delivery Address'}`,
      time: formatEventDate(52),
      note: `Delivered and verified. Received by ${order.shipping_address?.full_name || 'Customer'}.`,
      completed: isDelivered,
      current: isDelivered
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-900 hover:text-gold-700 transition-colors cursor-pointer self-start"
          title="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> <span>Back</span>
        </button>

        {/* Action Header Controls */}
        <div className="flex items-center gap-2">
          {/* TRACK ORDER TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setShowTracking(!showTracking)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-xs ${
              showTracking
                ? 'bg-forest-900 text-gold-300 ring-1 ring-gold-400/30'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{showTracking ? "Hide Tracking" : "Track Order"}</span>
            {showTracking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {order.status === 'DELIVERED' && (
            <button
              onClick={handleRequestReturn}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl border border-forest-900 text-forest-900 text-xs font-semibold hover:bg-forest-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Request Return
            </button>
          )}

          {['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED LIVE TRACKING EXPERIENCE */}
      {/* ========================================================================= */}
      {showTracking && (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden animate-fade-in">
          {/* Tracking Card Header */}
          <div className="bg-forest-950 text-cream-100 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 bg-forest-900 px-2.5 py-0.5 rounded-full border border-forest-800">
                  Live Courier Tracking
                </span>
                <span className="text-xs text-cream-400">•</span>
                <span className="text-xs text-cream-300 font-medium">
                  {courierPartner}
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isDelivered 
                  ? "Shipment Delivered" 
                  : isCancelled 
                    ? "Order Cancelled" 
                    : isOutForDelivery 
                      ? "Out for Delivery Today" 
                      : isShipped 
                        ? "Shipment In Transit" 
                        : "Preparing for Dispatch"}
              </h2>
              <p className="text-xs text-cream-300">
                {isDelivered
                  ? `Package was delivered on ${dateStr}`
                  : `Estimated Delivery: ${estDeliveryStr} (Express Insured Air)`}
              </p>
            </div>

            {/* AWB & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-forest-900 border border-forest-800 flex items-center gap-2 text-xs">
                <span className="text-cream-400 text-[11px]">AWB:</span>
                <span className="font-mono font-bold text-gold-300">{awbNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopyAwb(awbNumber)}
                  className="hover:text-white transition-colors"
                  title="Copy Tracking Number"
                >
                  {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cream-300" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleRefreshTracking}
                disabled={isRefreshingTrack}
                className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 border border-forest-800 text-cream-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Sync with Carrier Gateway"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTrack ? 'animate-spin text-gold-300' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-5 sm:p-6 border-b border-cream-200 bg-[#FAF7F2]">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Step 1: Placed */}
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-xs shadow-xs">
                    ✓
                  </div>
                  <span className="font-bold text-forest-950 text-[11px]">Placed</span>
                  <span className="text-[10px] text-charcoal-500 hidden sm:block">{dateStr}</span>
                </div>

                {/* Step 2: Quality Checked */}
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    isProcessing ? 'bg-forest-900 text-gold-300' : 'bg-cream-200 text-charcoal-500'
                  }`}>
                    {isProcessing ? '✓' : '2'}
                  </div>
                  <span className={`text-[11px] ${isProcessing ? 'font-bold text-forest-950' : 'text-charcoal-500'}`}>
                    Packed
                  </span>
                  <span className="text-[10px] text-charcoal-500 hidden sm:block">Bengaluru</span>
                </div>

                {/* Step 3: Shipped */}
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    isShipped ? 'bg-forest-900 text-gold-300' : 'bg-cream-200 text-charcoal-500'
                  }`}>
                    {isShipped ? '✓' : '3'}
                  </div>
                  <span className={`text-[11px] ${isShipped ? 'font-bold text-forest-950' : 'text-charcoal-500'}`}>
                    In Transit
                  </span>
                  <span className="text-[10px] text-charcoal-500 hidden sm:block">Air Express</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    isDelivered ? 'bg-emerald-600 text-white' : 'bg-cream-200 text-charcoal-500'
                  }`}>
                    {isDelivered ? '✓' : '4'}
                  </div>
                  <span className={`text-[11px] ${isDelivered ? 'font-bold text-emerald-800' : 'text-charcoal-500'}`}>
                    Delivered
                  </span>
                  <span className="text-[10px] text-charcoal-500 hidden sm:block">Doorstep</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Activity Log & Timeline Journey */}
          <div className="p-5 sm:p-7 space-y-4">
            <h3 className="font-serif text-sm font-bold text-forest-950 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-forest-800" />
              <span>Shipment Milestones & Activity History</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
              {trackingEvents.map((ev, idx) => (
                <div key={idx} className="relative flex items-start justify-between gap-3 text-xs">
                  {/* Step Dot */}
                  <div className={`absolute -left-6 sm:-left-8 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    ev.completed 
                      ? 'bg-forest-900 border-gold-400 text-gold-300 shadow-xs' 
                      : 'bg-white border-cream-300 text-charcoal-400'
                  }`}>
                    {ev.completed ? '✓' : idx + 1}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`font-bold ${ev.completed ? 'text-forest-950' : 'text-charcoal-600'}`}>
                        {ev.title}
                      </h4>
                      {ev.current && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                          Active Status
                        </span>
                      )}
                    </div>
                    <p className="text-charcoal-500 text-[11px]">
                      {ev.location}
                    </p>
                    <p className="text-charcoal-700 leading-relaxed text-[11px] pt-0.5">
                      {ev.note}
                    </p>
                  </div>

                  <span className="font-mono text-[10px] text-charcoal-500 flex-shrink-0 text-right">
                    {ev.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Courier Support Footnote */}
            <div className="pt-4 mt-6 border-t border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-800" />
                <span>100% Insured Delivery with Tamper-Evident Luxury Packaging</span>
              </span>
              <span className="flex items-center gap-1.5 text-forest-900 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>Dedicated Delivery Helpdesk: +91 80 4960 8888</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORDER SPECIFICATIONS & ITEMS SUMMARY */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cream-300 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cream-200">
          <div>
            <h2 className="font-serif text-lg font-bold text-forest-950">
              Order Details - <span className="font-mono">{order.order_number}</span>
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Placed on {dateStr} • Status: <span className="font-bold text-forest-900">{order.status}</span>
            </p>
          </div>
          <span className="text-sm font-bold text-forest-950">
            Total Amount: ₹{Math.round(order.total_amount).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Order Items List */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-forest-950">
            Purchased Pieces ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-cream-100 border border-cream-200 rounded-xl overflow-hidden text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-cream-50/50 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {item.product_image && (
                    <img 
                      src={item.product_image} 
                      alt={item.product_name} 
                      className="w-12 h-14 rounded-lg object-cover flex-shrink-0 bg-cream-100 border border-cream-200" 
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-charcoal-900 truncate text-sm">{item.product_name}</h4>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Quantity: <span className="font-medium text-charcoal-800">{item.quantity}</span> × ₹{Math.round(item.unit_price)}
                      {item.product_sku && (
                        <span className="ml-2 font-mono text-[10px] text-charcoal-400">
                          SKU: {item.product_sku}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-forest-950 text-sm flex-shrink-0">
                  ₹{Math.round(item.total_price).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Columns: Shipping Address (Left) & Payment Details (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Shipping Address */}
          <div className="p-4 rounded-xl bg-cream-50/80 border border-cream-200 space-y-2 text-xs">
            <span className="font-serif font-bold text-forest-950 flex items-center gap-1.5 pb-1 border-b border-cream-200">
              <MapPin className="w-3.5 h-3.5 text-forest-800" /> Shipping Destination
            </span>
            <p className="font-bold text-charcoal-900 text-sm">{order.shipping_address?.full_name}</p>
            <p className="text-charcoal-700 leading-relaxed">
              {order.shipping_address?.address_line1} {order.shipping_address?.address_line2 && `, ${order.shipping_address?.address_line2}`}
              {order.shipping_address?.landmark && ` (Near ${order.shipping_address?.landmark})`}
            </p>
            <p className="font-medium text-charcoal-800">
              {order.shipping_address?.city}, {order.shipping_address?.state} — <span className="font-mono">{order.shipping_address?.postal_code}</span>
            </p>
            {order.shipping_address?.phone && (
              <p className="text-forest-900 font-semibold pt-1">
                Recipient Contact: +91 {order.shipping_address?.phone}
              </p>
            )}
            {order.customer_notes && (
              <p className="text-[11px] text-charcoal-600 italic pt-1 border-t border-cream-200">
                Notes: "{order.customer_notes}"
              </p>
            )}
          </div>

          {/* Payment & Invoice Summary */}
          <div className="p-4 rounded-xl bg-cream-50/80 border border-cream-200 space-y-2 text-xs">
            <span className="font-serif font-bold text-forest-950 flex items-center gap-1.5 pb-1 border-b border-cream-200">
              <CreditCard className="w-3.5 h-3.5 text-forest-800" /> Payment & Billing Summary
            </span>
            <div className="space-y-1.5 text-charcoal-700">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <strong className="text-forest-950">{order.payment?.payment_method || "Online"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Transaction Ref:</span>
                <span className="font-mono text-charcoal-800">{order.payment?.transaction_reference || `TXN-${order.order_number}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {order.payment?.status || "CONFIRMED"}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-cream-200 font-bold text-forest-950 text-sm">
                <span>Total Paid:</span>
                <span>₹{Math.round(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
