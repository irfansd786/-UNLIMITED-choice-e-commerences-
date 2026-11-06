import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShoppingBag, 
  Layers, 
  DollarSign, 
  Boxes, 
  Tag, 
  Palette,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { adminAIService } from '../../services/api';
import { speakJarvis, playJarvisChime } from '../../services/jarvisVoiceService';

export default function JarvisProductBuilderModal() {
  const { 
    showProductBuilder, 
    activeProductDraft, 
    isPublishingProduct, 
    closeProductBuilder, 
    updateProductDraft, 
    setPublishingProduct,
    setSpeaking,
    setLastResponse
  } = useJarvisStore();

  if (!showProductBuilder || !activeProductDraft) return null;

  const handlePublish = async () => {
    try {
      setPublishingProduct(true);
      playJarvisChime('action');
      setLastResponse(`Publishing '${activeProductDraft.name}' to the live store catalogue...`);

      const payload = {
        name: activeProductDraft.name,
        slug: activeProductDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        category_id: activeProductDraft.category_id || 1,
        price: parseFloat(activeProductDraft.price) || 2999,
        compare_at_price: activeProductDraft.compare_at_price ? parseFloat(activeProductDraft.compare_at_price) : 4499,
        stock: parseInt(activeProductDraft.stock, 10) || 40,
        sku: `VE-${Date.now().toString().slice(-6)}`,
        brand: 'Varshi Enterprises',
        material: activeProductDraft.material || '100% French Terry Cotton (450 GSM)',
        color: activeProductDraft.color || 'Onyx Mineral Wash',
        description: activeProductDraft.description || `${activeProductDraft.name} engineered with luxury streetwear craftsmanship.`,
        sizes: activeProductDraft.sizes || ['S', 'M', 'L', 'XL']
      };

      const res = await adminAIService.executeAction('PUBLISH_PRODUCT', payload);

      const successMsg = `Successfully published '${activeProductDraft.name}' to the live customer store catalog, Chief!`;
      setLastResponse(successMsg);
      playJarvisChime('action');
      speakJarvis(successMsg, () => setSpeaking(true), () => setSpeaking(false));

      closeProductBuilder();
    } catch (err) {
      console.error('Failed to publish product:', err);
      const errorMsg = `Chief, product publishing encountered an issue: ${err.message || 'Verification error'}`;
      setLastResponse(errorMsg);
      speakJarvis(errorMsg, () => setSpeaking(true), () => setSpeaking(false));
      setPublishingProduct(false);
    }
  };

  const handleCancel = () => {
    playJarvisChime('action');
    const cancelMsg = "Product creation cancelled, Chief.";
    setLastResponse(cancelMsg);
    speakJarvis(cancelMsg, () => setSpeaking(true), () => setSpeaking(false));
    closeProductBuilder();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E7EBE7] shadow-xl overflow-hidden text-[#252A27] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-[#FAF6F0] border-b border-[#E7EBE7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173D30] text-[#C5A16E] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#173D30]">
                  Jarvis Voice Product Studio
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]">
                  Ready to Publish
                </span>
              </div>
              <p className="text-[11px] text-[#727A74]">
                Voice-guided catalog creation for Varshi Enterprises
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
              "Chief, I have filled the draft details below. You can adjust any field or say <b className="text-[#173D30]">"Publish it"</b> to push directly to our live customer store catalog."
            </p>
          </div>

          <div className="space-y-3">
            {/* Product Title */}
            <div>
              <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A16E]" />
                <span>Product Title</span>
              </label>
              <input
                type="text"
                value={activeProductDraft.name || ''}
                onChange={(e) => updateProductDraft({ name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] text-xs font-medium focus:border-[#173D30] focus:outline-none"
              />
            </div>

            {/* Price & Compare Price & Stock */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Price (₹)</span>
                </label>
                <input
                  type="number"
                  value={activeProductDraft.price || ''}
                  onChange={(e) => updateProductDraft({ price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#173D30] font-bold text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <Tag className="w-3.5 h-3.5 text-[#727A74]" />
                  <span>MRP (₹)</span>
                </label>
                <input
                  type="number"
                  value={activeProductDraft.compare_at_price || ''}
                  onChange={(e) => updateProductDraft({ compare_at_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#727A74] text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <Boxes className="w-3.5 h-3.5 text-[#173D30]" />
                  <span>Total Stock</span>
                </label>
                <input
                  type="number"
                  value={activeProductDraft.stock || ''}
                  onChange={(e) => updateProductDraft({ stock: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#173D30] font-bold text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>
            </div>

            {/* Fabric Material & Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <Palette className="w-3.5 h-3.5 text-[#C5A16E]" />
                  <span>Colorway</span>
                </label>
                <input
                  type="text"
                  value={activeProductDraft.color || ''}
                  onChange={(e) => updateProductDraft({ color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#252A27] flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#173D30]" />
                  <span>Material / Craft</span>
                </label>
                <input
                  type="text"
                  value={activeProductDraft.material || ''}
                  onChange={(e) => updateProductDraft({ material: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] text-xs focus:border-[#173D30] focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-semibold text-[#252A27] mb-1 block">
                Craftsmanship Description
              </label>
              <textarea
                rows={2}
                value={activeProductDraft.description || ''}
                onChange={(e) => updateProductDraft({ description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[#252A27] text-xs focus:border-[#173D30] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F7F8F6] border-t border-[#E7EBE7] flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl border border-[#E7EBE7] text-[#727A74] hover:text-[#252A27] hover:bg-white text-xs font-semibold transition-colors"
          >
            Cancel Draft
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishingProduct}
            className="px-5 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isPublishingProduct ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#C5A16E]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#C5A16E]" />
            )}
            <span>{isPublishingProduct ? 'Publishing to Store...' : 'Publish to Live Store'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
