import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  QrCode as QrCodeIcon, 
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Info,
  Banknote,
  ArrowLeft
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { addressService, orderService } from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart, appliedCoupon, couponDiscount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState(1); // 1: Address & Details, 2: Review & Summary, 3: Payment
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 3 options: 'COD' | 'CARD' | 'UPI'
  const [customerNotes, setCustomerNotes] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [paymentStage, setPaymentStage] = useState(''); // '', 'initiating', 'verifying', 'confirmed'
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [cardErrors, setCardErrors] = useState({});

  // Add/Edit Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'HOME',
    is_default: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    fetchCart();

    // Prefill user details if available
    if (user) {
      setAddressForm(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }

    async function loadAddresses() {
      try {
        const list = await addressService.getAll();
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find(a => a.is_default) || list[0];
          setSelectedAddressId(def.id);
        } else {
          setShowAddAddress(true);
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [isAuthenticated, user]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const isFreeDelivery = subtotal >= 999 || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const estimatedGst = Math.round(subtotal * 0.12); // Standard 12% apparel GST
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  // UPI configuration
  const upiId = 'unlimitedchoice@okhdfcbank';
  const upiPayload = `upi://pay?pa=${upiId}&pn=Unlimited+Choice&am=${Math.round(grandTotal)}&cu=INR&tn=Order+${Date.now().toString().slice(-6)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayload)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    addToast('UPI ID copied to clipboard!', 'info');
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm({ ...cardForm, cardNumber: formatted });
    if (cardErrors.cardNumber) setCardErrors({ ...cardErrors, cardNumber: null });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardForm({ ...cardForm, expiryDate: val });
    if (cardErrors.expiryDate) setCardErrors({ ...cardErrors, expiryDate: null });
  };

  const handleCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardForm({ ...cardForm, cvv: val });
    if (cardErrors.cvv) setCardErrors({ ...cardErrors, cvv: null });
  };

  const validateCardForm = () => {
    const errors = {};
    if (!cardForm.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required.';
    }
    const cleanNum = cardForm.cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      errors.cardNumber = 'Enter a valid 16-digit card number.';
    }
    if (!cardForm.expiryDate || cardForm.expiryDate.length < 5) {
      errors.expiryDate = 'Enter valid MM/YY expiry.';
    } else {
      const [m, y] = cardForm.expiryDate.split('/').map(Number);
      if (m < 1 || m > 12) errors.expiryDate = 'Invalid month.';
    }
    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      errors.cvv = 'CVV must be 3 or 4 digits.';
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.full_name.trim()) {
      addToast('Customer name is required.', 'error');
      return;
    }
    if (!addressForm.phone.trim() || addressForm.phone.replace(/\D/g, '').length < 10) {
      addToast('A valid 10-digit mobile number is required.', 'error');
      return;
    }
    if (!addressForm.address_line1.trim()) {
      addToast('Complete delivery address line is required.', 'error');
      return;
    }
    if (!addressForm.city.trim() || !addressForm.state.trim()) {
      addToast('City and state are required.', 'error');
      return;
    }
    if (!addressForm.postal_code.trim() || addressForm.postal_code.replace(/\D/g, '').length !== 6) {
      addToast('Enter a valid 6-digit postal PIN code.', 'error');
      return;
    }

    try {
      const created = await addressService.create({
        full_name: addressForm.full_name.trim(),
        phone: addressForm.phone.trim(),
        address_line1: addressForm.address_line1.trim(),
        address_line2: addressForm.address_line2?.trim() || '',
        landmark: addressForm.landmark?.trim() || '',
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postal_code: addressForm.postal_code.trim(),
        address_type: addressForm.address_type || 'HOME',
        is_default: addressForm.is_default ?? true,
      });
      setAddresses([created, ...addresses]);
      setSelectedAddressId(created.id);
      setShowAddAddress(false);
      addToast('Delivery address saved successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handleExecutePayment = async () => {
    if (!selectedAddressId) {
      addToast('Please select or provide a complete delivery address.', 'error');
      setStep(1);
      return;
    }
    if (items.length === 0) {
      addToast('Your shopping bag is empty.', 'error');
      navigate('/cart');
      return;
    }

    // If card payment selected, validate card details strictly
    if (paymentMethod === 'CARD') {
      const valid = validateCardForm();
      if (!valid) {
        addToast('Please complete all required card fields accurately.', 'error');
        return;
      }
    }

    setSubmittingOrder(true);
    setPaymentStage('initiating');

    try {
      if (paymentMethod === 'COD') {
        // Stage for Cash on Delivery
        await new Promise(r => setTimeout(r, 600));
        setPaymentStage('confirmed');
      } else {
        // Stage 1: Initiating Secure Payment
        await new Promise(r => setTimeout(r, 800));
        setPaymentStage('verifying');

        // Stage 2: Simulating Payment Gateway / Bank Verification (Security check)
        await new Promise(r => setTimeout(r, 1200));
        setPaymentStage('confirmed');
      }

      // Stage 3: Call backend to create order securely
      // Backend validates inventory, applies coupon, calculates totals, creates Payment record,
      // and updates order status
      const orderPayload = {
        address_id: selectedAddressId,
        payment_method: paymentMethod, // 'COD' | 'CARD' | 'UPI'
        customer_notes: customerNotes || undefined,
        coupon_code: appliedCoupon?.code || undefined,
      };

      const createdOrder = await orderService.create(orderPayload);
      await fetchCart(); // Refresh cart store to clear cart

      addToast(paymentMethod === 'COD' ? 'Order Placed with Cash on Delivery!' : 'Payment Verified! Order Confirmed.', 'success');
      navigate(`/order-confirmation/${createdOrder.order_number}`, { 
        state: { order: createdOrder } 
      });
    } catch (err) {
      addToast(err.message || 'Payment processing failed. Please try again.', 'error');
      setPaymentStage('');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
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
          Secure Checkout • UNLIMITED choice
        </span>
      </div>

      {/* 1. TOP CHECKOUT STEPPER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E5DF] shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
          {/* Step 1 */}
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 transition-colors ${step === 1 ? 'text-[#173D30] font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-all ${
              step >= 1 ? 'bg-[#173D30] text-[#C5A16E]' : 'bg-neutral-200 text-neutral-600'
            }`}>
              1
            </span>
            <span className="tracking-wide">SHIPPING & ADDRESS</span>
          </button>
          <div className="flex-1 h-[1px] bg-[#E8E5DF] mx-4"></div>

          {/* Step 2 */}
          <button
            onClick={() => selectedAddressId && setStep(2)}
            className={`flex items-center gap-2 transition-colors ${step === 2 ? 'text-[#173D30] font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-all ${
              step >= 2 ? 'bg-[#173D30] text-[#C5A16E]' : 'bg-neutral-200 text-neutral-600'
            }`}>
              2
            </span>
            <span className="tracking-wide">ORDER REVIEW</span>
          </button>
          <div className="flex-1 h-[1px] bg-[#E8E5DF] mx-4"></div>

          {/* Step 3 */}
          <button
            onClick={() => selectedAddressId && setStep(3)}
            className={`flex items-center gap-2 transition-colors ${step === 3 ? 'text-[#173D30] font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-all ${
              step >= 3 ? 'bg-[#173D30] text-[#C5A16E]' : 'bg-neutral-200 text-neutral-600'
            }`}>
              3
            </span>
            <span className="tracking-wide">PAYMENT</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Steps */}
        <div className="lg:col-span-7 space-y-6">

          {/* STEP 1: Address & Customer Details */}
          {step === 1 && (
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#173D30] tracking-tight">Delivery Address & Contact</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Where should we deliver your luxury garments?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-xs font-semibold text-[#173D30] hover:text-[#C5A16E] flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-[#E8E5DF] hover:border-[#173D30]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              </div>

              {/* Saved Addresses List */}
              {loadingAddresses ? (
                <div className="p-6 text-center text-xs text-neutral-500 animate-pulse">
                  Retrieving saved delivery destinations...
                </div>
              ) : addresses.length === 0 && !showAddAddress ? (
                <div className="p-6 text-center text-xs text-neutral-600 bg-[#F7F7F5] rounded-xl border border-[#E8E5DF]">
                  No delivery address on record. Please add your shipping address below.
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#173D30] bg-[#173D30]/5 ring-1 ring-[#173D30]'
                          : 'border-[#E8E5DF] hover:border-[#C5A16E]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="radio"
                          name="selected_address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-[#173D30] focus:ring-[#173D30]"
                        />
                        <div className="space-y-1 text-xs text-neutral-700 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900 text-sm">{addr.full_name}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                              {addr.address_type}
                            </span>
                          </div>
                          <p className="text-neutral-600 leading-relaxed">
                            {addr.address_line1} {addr.address_line2 && `, ${addr.address_line2}`}
                            {addr.landmark && ` (Near ${addr.landmark})`}
                          </p>
                          <p className="font-medium text-neutral-800">
                            {addr.city}, {addr.state} — <span className="font-mono">{addr.postal_code}</span>
                          </p>
                          <p className="font-medium text-[#173D30] pt-1 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" /> +91 {addr.phone}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add Address Form Modal / Inline */}
              {showAddAddress && (
                <form onSubmit={handleCreateAddress} className="p-5 rounded-xl bg-[#F7F7F5] border border-[#E8E5DF] space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
                    <h3 className="font-bold text-[#173D30] text-sm">Add New Delivery Address</h3>
                    <button 
                      type="button" 
                      onClick={() => setShowAddAddress(false)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        required
                        value={addressForm.full_name}
                        onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">Mobile Number (10 digits) *</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        required
                        maxLength={10}
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Complete Street Address (Flat / House No / Building) *</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Royale Meadows, 12th Main Road"
                      required
                      value={addressForm.address_line1}
                      onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                      className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">Area / Locality</label>
                      <input
                        type="text"
                        placeholder="e.g. Indiranagar Stage 2"
                        value={addressForm.address_line2}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Behind Metro Station"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">State *</label>
                      <input
                        type="text"
                        placeholder="e.g. Karnataka"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-medium mb-1">PIN Code (6 digits) *</label>
                      <input
                        type="text"
                        placeholder="e.g. 560038"
                        required
                        maxLength={6}
                        value={addressForm.postal_code}
                        onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-white border border-[#E8E5DF] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#173D30]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#173D30] text-[#C5A16E] font-bold tracking-wide hover:bg-[#112d23] transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!selectedAddressId) {
                    addToast('Please select or add a delivery address to proceed.', 'error');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full py-3.5 rounded-xl bg-[#173D30] hover:bg-[#112d23] text-[#C5A16E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Continue to Order Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Review Order Details */}
          {step === 2 && (
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#173D30] tracking-tight">Review Order & Shipping</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Please review your delivery details and order specifications</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-xs text-[#173D30] font-semibold hover:underline"
                >
                  Change Address
                </button>
              </div>

              {/* Selected Delivery Destination Card */}
              <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E8E5DF] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#173D30] font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C5A16E]" /> Delivering to:
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white border border-[#E8E5DF] rounded">
                    {selectedAddress?.address_type || 'HOME'}
                  </span>
                </div>
                <p className="font-bold text-neutral-900 text-sm">{selectedAddress?.full_name}</p>
                <p className="text-neutral-600 leading-relaxed">
                  {selectedAddress?.address_line1} {selectedAddress?.address_line2 && `, ${selectedAddress?.address_line2}`}
                  {selectedAddress?.landmark && ` (Near ${selectedAddress?.landmark})`}
                </p>
                <p className="font-medium text-neutral-800">
                  {selectedAddress?.city}, {selectedAddress?.state} — <span className="font-mono">{selectedAddress?.postal_code}</span>
                </p>
                <p className="text-[#173D30] font-medium pt-0.5">Contact: +91 {selectedAddress?.phone}</p>
              </div>

              {/* Delivery Notes / Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Delivery Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please ring doorbell twice or leave with security"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E5DF] rounded-xl p-3 text-xs focus:outline-none focus:border-[#173D30]"
                />
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border border-[#E8E5DF] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl bg-[#173D30] hover:bg-[#112d23] text-[#C5A16E] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method Selection */}
          {step === 3 && (
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#173D30] tracking-tight">Select Payment Method</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Choose your preferred secure payment channel</p>
                </div>
                <span className="text-[11px] text-[#173D30] font-semibold flex items-center gap-1.5 bg-[#173D30]/10 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#173D30]" /> 256-Bit SSL Secured
                </span>
              </div>

              {/* Payment Method Radio Selection List (Professional Luxury Layout) */}
              <div className="space-y-3">
                {/* 1. Cash on Delivery (COD) */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#173D30] bg-[#173D30]/[0.03] shadow-xs ring-1 ring-[#173D30]/20'
                      : 'border-[#E8E5DF] hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="pt-0.5">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      paymentMethod === 'COD' ? 'border-[#173D30]' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'COD' && (
                        <span className="w-2 h-2 rounded-full bg-[#173D30]"></span>
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-sm">Cash on Delivery (COD)</span>
                      <Banknote className="w-4 h-4 text-neutral-400" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Pay cash or UPI at your doorstep upon package arrival • Zero advance payment
                    </p>
                  </div>
                </label>

                {/* 2. Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-[#173D30] bg-[#173D30]/[0.03] shadow-xs ring-1 ring-[#173D30]/20'
                      : 'border-[#E8E5DF] hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="pt-0.5">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      paymentMethod === 'CARD' ? 'border-[#173D30]' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'CARD' && (
                        <span className="w-2 h-2 rounded-full bg-[#173D30]"></span>
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-sm">Credit / Debit Card</span>
                      <CreditCard className="w-4 h-4 text-neutral-400" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Visa, Mastercard, RuPay & all major Indian / International cards
                    </p>
                  </div>
                </label>

                {/* 3. UPI Payment */}
                <label
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#173D30] bg-[#173D30]/[0.03] shadow-xs ring-1 ring-[#173D30]/20'
                      : 'border-[#E8E5DF] hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="pt-0.5">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      paymentMethod === 'UPI' ? 'border-[#173D30]' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'UPI' && (
                        <span className="w-2 h-2 rounded-full bg-[#173D30]"></span>
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-sm">UPI Payment</span>
                      <QrCodeIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Instant scan & pay via dynamic QR code or merchant UPI ID
                    </p>
                  </div>
                </label>
              </div>

              {/* DEDICATED PAYMENT DETAILS PANE */}
              {/* Option A: Cash on Delivery (COD) Details */}
              {paymentMethod === 'COD' && (
                <div className="p-5 rounded-xl bg-[#F9F9F8] border border-[#E8E5DF] space-y-3.5 text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
                    <span className="font-bold text-[#173D30] text-sm">Cash on Delivery Information</span>
                    <span className="text-[11px] font-semibold text-neutral-700 bg-white border border-[#E8E5DF] px-2.5 py-0.5 rounded-full">
                      Payable at Doorstep
                    </span>
                  </div>

                  <div className="space-y-2.5 text-neutral-700">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">
                        <strong>No advance online payment required.</strong> Pay {grandTotal > 0 ? `₹${Math.round(grandTotal).toLocaleString('en-IN')}` : 'your order amount'} in cash or via courier QR code upon package delivery.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-[#173D30] mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">
                        Free insured express shipping dispatched from our Bengaluru fulfillment studio with live SMS tracking.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#C5A16E] mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">
                        Doorstep verification and 30-day effortless return guarantee included with original tags.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Option B: Credit / Debit Card Details */}
              {paymentMethod === 'CARD' && (
                <div className="p-5 rounded-xl bg-[#F9F9F8] border border-[#E8E5DF] space-y-4 text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
                    <span className="font-bold text-[#173D30] text-sm">Enter Card Details</span>
                    <span className="text-[11px] text-neutral-500 font-mono">256-Bit SSL • PCI-DSS Compliant</span>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Cardholder Name *</label>
                    <input
                      type="text"
                      placeholder="NAME AS PRINTED ON CARD"
                      value={cardForm.cardholderName}
                      onChange={(e) => {
                        setCardForm({ ...cardForm, cardholderName: e.target.value.toUpperCase() });
                        if (cardErrors.cardholderName) setCardErrors({ ...cardErrors, cardholderName: null });
                      }}
                      className={`w-full bg-white border rounded-lg p-2.5 text-xs focus:outline-none ${
                        cardErrors.cardholderName ? 'border-red-400' : 'border-[#E8E5DF] focus:border-[#173D30]'
                      }`}
                    />
                    {cardErrors.cardholderName && (
                      <p className="text-[11px] text-red-500 mt-1">{cardErrors.cardholderName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Card Number *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8899"
                        value={cardForm.cardNumber}
                        onChange={handleCardNumberChange}
                        className={`w-full bg-white border rounded-lg p-2.5 text-xs font-mono tracking-wider focus:outline-none ${
                          cardErrors.cardNumber ? 'border-red-400' : 'border-[#E8E5DF] focus:border-[#173D30]'
                        }`}
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                    {cardErrors.cardNumber && (
                      <p className="text-[11px] text-red-500 mt-1">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">Expiry Date (MM/YY) *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardForm.expiryDate}
                        onChange={handleExpiryChange}
                        className={`w-full bg-white border rounded-lg p-2.5 text-xs font-mono focus:outline-none ${
                          cardErrors.expiryDate ? 'border-red-400' : 'border-[#E8E5DF] focus:border-[#173D30]'
                        }`}
                      />
                      {cardErrors.expiryDate && (
                        <p className="text-[11px] text-red-500 mt-1">{cardErrors.expiryDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">CVV / CVC (3-4 digits) *</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={handleCvvChange}
                        className={`w-full bg-white border rounded-lg p-2.5 text-xs font-mono focus:outline-none ${
                          cardErrors.cvv ? 'border-red-400' : 'border-[#E8E5DF] focus:border-[#173D30]'
                        }`}
                      />
                      {cardErrors.cvv && (
                        <p className="text-[11px] text-red-500 mt-1">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#E8E5DF] flex items-center gap-2 text-[11px] text-neutral-500">
                    <ShieldCheck className="w-4 h-4 text-[#173D30] flex-shrink-0" />
                    <span>Card numbers and CVV are never stored on UNLIMITED choice servers. Tokens are processed directly with authorized bank gateways.</span>
                  </div>
                </div>
              )}

              {/* Option C: UPI Payment Details */}
              {paymentMethod === 'UPI' && (
                <div className="p-5 rounded-xl bg-[#F9F9F8] border border-[#E8E5DF] space-y-4 text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
                    <span className="font-bold text-[#173D30] text-sm">Scan Dynamic QR Code</span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Instant Authorization
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#E8E5DF] max-w-xs mx-auto shadow-xs">
                    <img 
                      src={qrCodeUrl} 
                      alt="UNLIMITED choice Dynamic UPI QR Code" 
                      className="w-44 h-44 rounded-lg object-contain"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-[11px] text-neutral-500">Payable Amount</p>
                      <p className="font-serif text-xl font-bold text-[#173D30]">
                        ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#E8E5DF] text-xs max-w-md mx-auto">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Official Merchant UPI ID</span>
                      <span className="font-mono font-bold text-[#173D30] truncate block">{upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors flex-shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy ID
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Processing Overlay Indicator */}
              {submittingOrder && (
                <div className="p-4 rounded-xl bg-[#173D30]/10 border border-[#173D30]/20 text-xs text-[#173D30] space-y-2 text-center animate-pulse">
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#173D30]" />
                    {paymentStage === 'initiating' && "Initiating Secure Bank Handshake..."}
                    {paymentStage === 'verifying' && "Verifying Payment with Gateway..."}
                    {paymentStage === 'confirmed' && "Payment Verified! Finalizing Order..."}
                  </div>
                  <p className="text-[11px] text-neutral-600">Please do not refresh or close this window.</p>
                </div>
              )}

              {/* Step Navigation & Action Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={submittingOrder}
                  className="flex-1 py-3.5 rounded-xl border border-[#E8E5DF] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={submittingOrder}
                  className="flex-1 py-3.5 rounded-xl bg-[#173D30] hover:bg-[#112d23] text-[#C5A16E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {submittingOrder ? (
                    paymentMethod === 'COD' ? "Confirming COD Order..." : "Verifying Payment..."
                  ) : (
                    paymentMethod === 'COD' 
                      ? `Confirm Cash on Delivery (₹${Math.round(grandTotal).toLocaleString('en-IN')})`
                      : paymentMethod === 'CARD'
                        ? `Pay ₹${Math.round(grandTotal).toLocaleString('en-IN')} via Card`
                        : `Pay ₹${Math.round(grandTotal).toLocaleString('en-IN')} via UPI`
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Order Summary (Sticky) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#173D30] pb-3 border-b border-[#E8E5DF]">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Product Thumbnails List */}
            <div className="divide-y divide-[#E8E5DF] max-h-64 overflow-y-auto pr-1">
              {items.map((it) => {
                const p = it.product || {};
                const img = p.image_url || p.images?.[0]?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
                const itemTotal = (it.item_total !== undefined && !isNaN(it.item_total))
                  ? it.item_total
                  : ((p.price || 0) * (it.quantity || 1));
                const itemSize = p.selectedSize || it.selected_size || p.size || 'M';
                const itemColor = p.selectedColor || it.selected_color || p.color || '';

                return (
                  <div key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={img} 
                        alt={p.name} 
                        className="w-12 h-14 rounded-lg object-cover flex-shrink-0 bg-neutral-100 border border-[#E8E5DF]" 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-neutral-900 truncate">{p.name}</h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Qty: <span className="font-medium text-neutral-800">{it.quantity}</span> × ₹{Math.round(p.price || 0)}
                          {itemSize && (
                            <span className="ml-1.5 px-1.5 py-0.2 bg-neutral-100 text-neutral-700 rounded font-semibold text-[10px]">
                              {itemSize}
                            </span>
                          )}
                          {itemColor && (
                            <span className="ml-1 text-neutral-600">
                              • {itemColor}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#173D30] flex-shrink-0">
                      ₹{Math.round(itemTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="divide-y divide-[#E8E5DF] pt-2 space-y-2 border-t border-[#E8E5DF]">
              <div className="flex justify-between text-neutral-700 pt-1">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 pt-1">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">- ₹{Math.round(couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-700 pt-1">
                <span>Shipping Charges</span>
                <span className="font-semibold text-emerald-700">
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-neutral-500 pt-1 text-[11px]">
                <span className="flex items-center gap-1">
                  Estimated GST (12% Apparel)
                </span>
                <span className="font-medium">₹{estimatedGst.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#173D30] pt-2.5">
                <span>Final Payable Amount</span>
                <span className="text-base text-[#173D30]">₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust and Guarantee Badges */}
            <div className="pt-2 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5 border-t border-[#E8E5DF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#173D30]" />
              <span>100% Encrypted & Authenticated UNLIMITED choice Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
