import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Ticket, 
  Percent, 
  DollarSign, 
  Users, 
  ShieldCheck,
  RefreshCw,
  Ban
} from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { adminCouponService } from '../../services/api';
import { speakJarvis, playJarvisChime } from '../../services/jarvisVoiceService';

export default function JarvisCouponModal() {
  const { 
    showCouponModal, 
    activeCouponDraft, 
    isSavingCoupon, 
    closeCouponModal, 
    updateCouponDraft, 
    setSavingCoupon,
    setSpeaking,
    setLastResponse
  } = useJarvisStore();

  if (!showCouponModal || !activeCouponDraft) return null;

  const handleSaveCoupon = async () => {
    try {
      setSavingCoupon(true);
      playJarvisChime('action');
      setLastResponse(`Saving and activating coupon '${activeCouponDraft.code}' in the database...`);

      const payload = {
        code: (activeCouponDraft.code || 'SAVE20').trim().toUpperCase(),
        description: activeCouponDraft.description || `${activeCouponDraft.discount_value}% promotional discount code`,
        discount_type: activeCouponDraft.discount_type || 'PERCENTAGE',
        discount_value: parseFloat(activeCouponDraft.discount_value) || 20,
        min_order_value: parseFloat(activeCouponDraft.min_order_value) || 999,
        max_discount_amount: activeCouponDraft.max_discount_amount ? parseFloat(activeCouponDraft.max_discount_amount) : 500,
        usage_limit: activeCouponDraft.usage_limit ? parseInt(activeCouponDraft.usage_limit, 10) : 200,
        is_active: true
      };

      await adminCouponService.create(payload);

      const successMsg = `Coupon '${payload.code}' has been successfully created and activated, Chief!`;
      setLastResponse(successMsg);
      playJarvisChime('action');
      speakJarvis(successMsg, () => setSpeaking(true), () => setSpeaking(false));

      closeCouponModal();
      if (window.location.pathname === '/coupons') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to create coupon:', err);
      const errorMsg = `Chief, coupon creation error: ${err.message || 'Validation error'}`;
      setLastResponse(errorMsg);
      speakJarvis(errorMsg, () => setSpeaking(true), () => setSpeaking(false));
      setSavingCoupon(false);
    }
  };

  const handleCancel = () => {
    playJarvisChime('action');
    const cancelMsg = "Coupon creation cancelled, Chief.";
    setLastResponse(cancelMsg);
    speakJarvis(cancelMsg, () => setSpeaking(true), () => setSpeaking(false));
    closeCouponModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E7EBE7] shadow-xl overflow-hidden text-[#252A27] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-[#FAF6F0] border-b border-[#E7EBE7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173D30] text-[#C5A16E] flex items-center justify-center shadow-xs">
              <Ticket className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#173D30]">
                  Jarvis Voice Coupon Studio
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#FAF6F0] text-[#173D30] border border-[#C5A16E]/40">
                  Voice Decision
                </span>
              </div>
              <p className="text-[11px] text-[#727A74]">
                Voice-guided promotional coupon creation for UNLIMITED choice
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-[#727A74] hover:text-[#252A27] hover:bg-[#F7F8F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/30 text-xs flex items-start gap-2.5">
            <span className="text-[#173D30] font-bold font-mono">JARVIS:</span>
            <p className="text-[#252A27] leading-relaxed text-[12px]">
              "Chief, I have drafted coupon <b className="text-[#173D30] font-mono font-bold">{activeCouponDraft.code}</b> with <b className="text-emerald-700">{activeCouponDraft.discount_value}% discount</b>. Click <b className="text-[#173D30]">"Save & Activate"</b> or say <b className="text-[#173D30]">"Save it"</b>."
            </p>
          </div>

          <div className="space-y-3">
            {/* Coupon Code & Discount Value */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <Ticket className="w-3.5 h-3.5 text-[#C5A16E]" />
                  <span>Promo Code</span>
                </label>
                <input
                  type="text"
                  value={activeCouponDraft.code || ''}
                  onChange={(e) => updateCouponDraft({ code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#173D30] font-mono font-bold text-sm uppercase tracking-wider focus:border-[#173D30] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Discount Value</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={activeCouponDraft.discount_value || ''}
                    onChange={(e) => updateCouponDraft({ discount_value: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#173D30] font-bold text-sm focus:border-[#173D30] focus:outline-none"
                  />
                  <span className="text-xs font-mono font-bold text-[#727A74]">%</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-semibold text-[#252A27] mb-1 block">
                Promo Campaign Description
              </label>
              <input
                type="text"
                value={activeCouponDraft.description || ''}
                onChange={(e) => updateCouponDraft({ description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] text-xs focus:border-[#173D30] focus:outline-none"
              />
            </div>

            {/* Minimum Order Value & Max Cap */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#173D30]" />
                  <span>Min Order (₹)</span>
                </label>
                <input
                  type="number"
                  value={activeCouponDraft.min_order_value || ''}
                  onChange={(e) => updateCouponDraft({ min_order_value: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] font-semibold text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A16E]" />
                  <span>Max Cap (₹)</span>
                </label>
                <input
                  type="number"
                  value={activeCouponDraft.max_discount_amount || ''}
                  onChange={(e) => updateCouponDraft({ max_discount_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] font-semibold text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-[#727A74]" />
                <span>Max Redemptions Limit</span>
              </label>
              <input
                type="number"
                value={activeCouponDraft.usage_limit || ''}
                onChange={(e) => updateCouponDraft({ usage_limit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] font-semibold text-xs focus:border-[#173D30] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F7F8F6] border-t border-[#E7EBE7] flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl border border-[#E7EBE7] text-[#727A74] hover:text-[#252A27] hover:bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            onClick={handleSaveCoupon}
            disabled={isSavingCoupon}
            className="px-5 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSavingCoupon ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#C5A16E]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#C5A16E]" />
            )}
            <span>{isSavingCoupon ? 'Activating Coupon...' : 'Save & Activate'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
