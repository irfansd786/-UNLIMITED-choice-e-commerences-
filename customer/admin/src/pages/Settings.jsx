import React, { useState } from 'react';
import { Settings as SettingsIcon, Store, ShieldCheck, Mail, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [storeName, setStoreName] = useState('VARSHI ENTERPRISES');
  const [supportEmail, setSupportEmail] = useState('care@varshienterprises.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [headOffice, setHeadOffice] = useState('Varshi Commercial Complex, MG Road, Bengaluru - 560001');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(99);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Store Configurations & Operations</h1>
        <p className="text-xs text-[#727A74] mt-1">Configure business contact details, delivery fee thresholds, and store policies</p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-[#EBF5F0] border border-[#D5E6DF] text-[#173D30] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Store operating parameters saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7EBE7] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBE7]">
            <div className="p-2 rounded-lg bg-[#FAF6F0] text-[#173D30] border border-[#C5A16E]/30">
              <Store className="w-4 h-4 text-[#C5A16E]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#173D30]">Business Identity</h3>
              <p className="text-xs text-[#727A74]">Official business and customer support contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252A27] mb-1">Store Legal Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252A27] mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252A27] mb-1">Support Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252A27] mb-1">Head Office Location</label>
              <input
                type="text"
                value={headOffice}
                onChange={(e) => setHeadOffice(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Logistics */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7EBE7] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EBE7]">
            <div className="p-2 rounded-lg bg-[#FAF6F0] text-[#173D30] border border-[#C5A16E]/30">
              <ShieldCheck className="w-4 h-4 text-[#C5A16E]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#173D30]">Delivery Fee Rules (INR ₹)</h3>
              <p className="text-xs text-[#727A74]">Free shipping thresholds and standard freight rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252A27] mb-1">Free Delivery Minimum Order (₹)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252A27] mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Save className="w-4 h-4 text-[#C5A16E]" />
          <span>Save Operating Settings</span>
        </button>
      </form>
    </div>
  );
}
