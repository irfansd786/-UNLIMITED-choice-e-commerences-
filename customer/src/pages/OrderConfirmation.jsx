import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  MapPin, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Check,
  Printer,
  Download,
  FileText,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { orderService } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { InvoicePrinter, downloadInvoiceHtml, printInvoiceDocument } from '@/components/lightswind/invoice-printer';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  
  // 4-Second Automated Printer Orchestration
  const [countdown, setCountdown] = useState(4);
  const [printerTriggered, setPrinterTriggered] = useState(false);
  const [printFinished, setPrintFinished] = useState(false);

  const printerSectionRef = useRef(null);

  useEffect(() => {
    // Fire celebratory confetti on mount
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#173D30', '#C5A16E', '#16382C', '#D2B47A', '#FFFFFF']
    });

    if (!order) {
      async function loadOrder() {
        try {
          const data = await orderService.getByIdOrNumber(orderNumber);
          setOrder(data);
        } catch (err) {
          console.error("Failed to load order", err);
        } finally {
          setLoading(false);
        }
      }
      loadOrder();
    }
  }, [orderNumber]);

  // Exact 4-Second Countdown Timer
  useEffect(() => {
    if (loading || !order || printerTriggered) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setPrinterTriggered(true);
      // Smoothly scroll to the invoice printer
      setTimeout(() => {
        printerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [countdown, loading, order, printerTriggered]);

  const handleManualTrigger = () => {
    setCountdown(0);
    setPrinterTriggered(true);
    setTimeout(() => {
      printerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-full border-4 border-[#173D30] border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-[#173D30]">Verifying and retrieving your order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="font-serif text-2xl font-bold text-[#173D30]">Order Not Found</h2>
        <p className="text-xs text-neutral-600">We could not locate this order. Please verify your order number in your account.</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-2.5 rounded-full bg-[#173D30] text-[#C5A16E] text-xs font-bold uppercase tracking-wider"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Format real order into Lightswind InvoiceData structure
  const orderDate = new Date(order.created_at || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const invoiceItems = (order.items || []).map((it, idx) => ({
    id: String(it.id || idx + 1),
    description: it.product_name,
    hsnCode: '6109', // HSN code for cotton garments/apparel
    qty: it.quantity,
    rate: Math.round(it.unit_price),
    total: Math.round(it.total_price),
  }));

  const shippingAddr = order.shipping_address || {};
  const formattedAddress = [
    shippingAddr.address_line1,
    shippingAddr.address_line2,
    shippingAddr.landmark ? `Near ${shippingAddr.landmark}` : null,
    shippingAddr.city,
    `${shippingAddr.state || ''} ${shippingAddr.postal_code || ''}`.trim()
  ].filter(Boolean).join(', ');

  const calculatedTax = Math.round(order.subtotal * 0.12);

  const isCod = order.payment_method === 'COD' || order.payment?.payment_method === 'COD';

  const realInvoiceData = {
    invoiceTitle: isCod ? "ORDER RECEIPT & INVOICE" : "TAX INVOICE",
    invoiceNumber: `INV-${order.order_number.replace(/^VE-/, '')}`,
    issueDate: formattedDate,
    dueDate: isCod ? "PAYABLE UPON DELIVERY" : formattedDate,
    time: formattedTime,
    poNumber: order.order_number,
    paymentTerms: isCod ? "CASH ON DELIVERY (PAYABLE AT DOOR)" : "PAID IN FULL (IMMEDIATE)",

    // Official Unlimited Choice Details
    companyName: "UNLIMITED CHOICE",
    companySubtitle: "Wear More • Choose Better | Premium Contemporary Fashion",
    companyAddress: "108 Indiranagar 100ft Road, Stage 2, Bengaluru, Karnataka 560038, India",
    companyGstin: "29AAACV5849E1ZT",
    companyEmail: "orders@unlimitedchoice.com",
    companyPhone: "+91 80 4960 8888",
    companyWebsite: "www.unlimitedchoice.com",
    companyLogoBadge: "UC",

    // Real Customer Details
    clientName: shippingAddr.full_name || user?.full_name || "Valued Patron",
    clientAddress: formattedAddress || "Bengaluru, Karnataka, India",
    clientPhone: shippingAddr.phone ? `+91 ${shippingAddr.phone}` : "",
    clientEmail: user?.email || "customer@unlimitedchoice.com",

    // Currency & Items
    currency: "INR",
    currencySymbol: "₹",
    items: invoiceItems.length > 0 ? invoiceItems : [
      {
        id: "1",
        description: "Unlimited Choice Premium Garment Collection",
        hsnCode: "6109",
        qty: 1,
        rate: Math.round(order.total_amount),
        total: Math.round(order.total_amount)
      }
    ],

    // Financial Breakdown
    subtotal: Math.round(order.subtotal),
    taxRate: 12,
    taxAmount: calculatedTax,
    cgstAmount: Math.round(calculatedTax / 2),
    sgstAmount: Math.round(calculatedTax / 2),
    discount: Math.round(order.discount || 0),
    shippingAmount: Math.round(order.delivery_fee || 0),
    total: Math.round(order.total_amount),

    // Payment Information
    paymentMethod: order.payment?.payment_method || "UPI / CARD",
    transactionId: order.payment?.transaction_reference || `TXN-${order.order_number}`,
    authCode: "AUTH-OK-200",
    bankDetails: {
      bankName: "HDFC Bank Ltd",
      accountNumber: "50200088991122",
      ifscOrSwift: "HDFC0001234",
      upiId: "unlimitedchoice@okhdfcbank",
      branch: "Indiranagar Branch, Bengaluru"
    },

    // Signatures & Notes
    authorizedSignatoryName: "Unlimited Choice Fulfillment Desk",
    authorizedSignatoryTitle: "Head of Quality & Fulfillment",
    termsAndConditions: "All garments are crafted with premium bespoke materials. 30-day effortless returns with original tags intact.",
    footerNote: "Thank you for choosing UNLIMITED choice. Wear More • Choose Better."
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 font-sans">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-[#E8E5DF] text-stone-800 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A16E]">
          Order Confirmation • UNLIMITED choice
        </span>
      </div>

      {/* =========================================================================
          1. TOP ROW (FITS ON ONE SCREEN / PAGE NO SCROLLING DOWN):
             LEFT: Order Confirmation & Shipping Stepper
             RIGHT: Live Mechanical Thermal POS Receipt Printer
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT CARD: ORDER CONFIRMATION HERO */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-sm text-center flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Animated Success Badge */}
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-sm animate-bounce-subtle">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#C5A16E] block">
                {isCod ? "Order Confirmed • Cash on Delivery" : "Payment Verified • Official Order Placed"}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30] tracking-tight">
                Thank You For Your Order!
              </h1>
              <p className="text-xs font-mono font-bold text-neutral-800 pt-1">
                Order Reference: <span className="text-[#173D30] bg-[#173D30]/10 px-2.5 py-1 rounded-md">{order.order_number}</span>
              </p>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto pt-1 leading-relaxed">
                {isCod 
                  ? "Your Cash on Delivery order is confirmed! Please keep the exact amount ready upon delivery at your doorstep." 
                  : "Your transaction has been securely authorized and your pieces are now scheduled for tailoring and fulfillment at our Bengaluru studio."}
              </p>
            </div>

            {/* 4-Step Shipping Progress Indicator */}
            <div className="pt-4 border-t border-[#E8E5DF] max-w-md mx-auto">
              <div className="grid grid-cols-4 gap-2 text-center text-[10.5px]">
                <div className="space-y-1 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    ✓
                  </div>
                  <span className="font-bold text-[#173D30]">Confirmed</span>
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#173D30] text-[#C5A16E] flex items-center justify-center text-xs font-bold shadow-xs animate-pulse">
                    2
                  </div>
                  <span className="font-semibold text-neutral-800">Processing</span>
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 border border-[#E8E5DF] flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span className="text-neutral-400">Shipped</span>
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 border border-[#E8E5DF] flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <span className="text-neutral-400">Delivered</span>
                </div>
              </div>
            </div>

            {/* 4-SECOND COUNTDOWN CALLOUT */}
            {!printerTriggered && (
              <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E8E5DF] max-w-md mx-auto flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#173D30] text-[#C5A16E] flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 animate-pulse">
                    {countdown}s
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#173D30]">Generating Tax Invoice...</p>
                    <p className="text-[10px] text-neutral-500">Live mechanical printer starts in {countdown}s.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleManualTrigger}
                  className="px-3 py-1.5 rounded-lg bg-[#173D30] hover:bg-[#112d23] text-[#C5A16E] text-[11px] font-bold uppercase tracking-wider flex-shrink-0 transition-all shadow-xs cursor-pointer"
                >
                  Print Now
                </button>
              </div>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-3 pt-3">
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto w-full">
              <Link
                to={`/account/orders/${order.order_number}`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112d23] text-[#C5A16E] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm text-center"
              >
                View in Orders
              </Link>
              <Link
                to="/products"
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-[#E8E5DF] text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Subtle Scroll Down Prompt for Address & Payment */}
            <div className="pt-2 text-center">
              <a
                href="#order-logistics"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-[#173D30] transition-colors"
              >
                <span>Scroll down for Delivery Address & Payment Details</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#C5A16E]" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: AUTOMATIC LIGHTSWIND INVOICE PRINTER (THERMAL POS ONLY) */}
        <div ref={printerSectionRef} className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E5DF] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E8E5DF]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A16E]" />
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#173D30]">
                  Official Tax Receipt & Invoice
                </h2>
              </div>
              <p className="text-[11px] text-neutral-500">
                Live mechanical Thermal POS receipt printing simulation with real order data & GST compliance
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-xl border border-[#E8E5DF] text-xs font-bold text-[#173D30] self-start sm:self-auto">
              <Printer className="w-3.5 h-3.5 text-[#C5A16E]" />
              <span>Thermal POS Mode</span>
            </div>
          </div>

          {/* Live Invoice Printer Hardware Container */}
          <div className="p-3 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden min-h-[440px] sm:min-h-[480px] flex items-center justify-center flex-1">
            <InvoicePrinter
              invoiceData={realInvoiceData}
              format="thermal"
              theme="light"
              speed={1.2}
              autoPrint={printerTriggered}
              showStamp={true}
              stampText={isCod ? "ORDER CONFIRMED" : "PAID & CONFIRMED"}
              stampType={isCod ? "verified" : "paid"}
              showControls={true}
              onPrintComplete={() => {
                setPrintFinished(true);
              }}
              onDownload={(data) => {
                downloadInvoiceHtml(data);
              }}
            />
          </div>
        </div>

      </div>

      {/* =========================================================================
          2. BOTTOM ROW (ACCESSED BY SCROLLING DOWN):
             Delivery Address & Payment Details Snapshot
          ========================================================================= */}
      <div id="order-logistics" className="pt-4 space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
          <h2 className="font-serif text-lg font-bold text-[#173D30]">
            Order Logistics & Payment Summary
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {order.order_number}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          {/* Delivery Address Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-[#173D30] pb-2.5 border-b border-[#E8E5DF] text-sm">
              <MapPin className="w-4 h-4 text-[#C5A16E]" /> Delivery Address
            </div>
            <p className="font-bold text-neutral-900 text-sm">{shippingAddr.full_name}</p>
            <p className="text-neutral-600 leading-relaxed text-xs">{formattedAddress}</p>
            {shippingAddr.phone && (
              <p className="text-[#173D30] font-semibold pt-1">Phone: +91 {shippingAddr.phone}</p>
            )}
          </div>

          {/* Payment Details Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-[#173D30] pb-2.5 border-b border-[#E8E5DF] text-sm">
              <ShieldCheck className="w-4 h-4 text-[#C5A16E]" /> Payment Details
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Payment Method:</span>
              <span className="font-bold text-neutral-900">{order.payment?.payment_method || (isCod ? 'CASH ON DELIVERY' : 'UPI')}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Transaction Ref:</span>
              <span className="font-mono text-neutral-900">{order.payment?.transaction_reference || `TXN-${order.order_number}`}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {order.payment?.status || (isCod ? 'PENDING (PAY ON DELIVERY)' : 'PAID')}
              </span>
            </div>
            <div className="flex justify-between text-[#173D30] font-bold text-sm pt-2 border-t border-[#E8E5DF]">
              <span>Amount {isCod ? 'Payable' : 'Paid'}:</span>
              <span>₹{Math.round(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
