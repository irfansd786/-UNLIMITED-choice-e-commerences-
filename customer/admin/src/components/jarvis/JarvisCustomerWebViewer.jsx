import React, { useRef, useState } from 'react';
import { 
  X, 
  ExternalLink, 
  RotateCw, 
  Globe, 
  Sparkles,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { speakJarvis, playJarvisChime } from '../../services/jarvisVoiceService';

export default function JarvisCustomerWebViewer() {
  const { 
    showCustomerWebViewer, 
    customerWebViewerUrl, 
    customerWebViewerTitle, 
    closeCustomerWebViewer,
    setSpeaking,
    setLastResponse
  } = useJarvisStore();

  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceMode, setDeviceMode] = useState('desktop');

  if (!showCustomerWebViewer) return null;

  const handleClose = () => {
    playJarvisChime('action');
    const msg = "Customer store viewer closed, Chief.";
    setLastResponse(msg);
    speakJarvis(msg, () => setSpeaking(true), () => setSpeaking(false));
    closeCustomerWebViewer();
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = customerWebViewerUrl;
    }
  };

  const handleOpenExternal = () => {
    playJarvisChime('action');
    window.open(customerWebViewerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full ${deviceMode === 'mobile' ? 'max-w-md h-[92vh]' : 'max-w-6xl h-[92vh]'} rounded-2xl bg-white border border-[#E7EBE7] shadow-2xl flex flex-col overflow-hidden text-[#252A27] transition-all duration-300 animate-in zoom-in-95`}>
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-[#FAF6F0] border-b border-[#E7EBE7] flex items-center justify-between gap-3 flex-shrink-0">
          
          {/* Title & Live Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#173D30] text-[#C5A16E] flex items-center justify-center shadow-xs flex-shrink-0">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-[#173D30] truncate">
                  {customerWebViewerTitle || 'Live Customer Storefront'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF] flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  LIVE (5173)
                </span>
              </div>
              <p className="text-[11px] text-[#727A74] font-mono truncate">
                {customerWebViewerUrl}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Device Toggle */}
            <div className="hidden sm:flex items-center rounded-xl bg-white border border-[#E7EBE7] p-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                title="Desktop View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${deviceMode === 'desktop' ? 'bg-[#173D30] text-white' : 'text-[#727A74] hover:text-[#252A27]'}`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                title="Mobile View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${deviceMode === 'mobile' ? 'bg-[#173D30] text-white' : 'text-[#727A74] hover:text-[#252A27]'}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reload Frame */}
            <button
              onClick={handleReload}
              className="p-2 rounded-xl bg-white hover:bg-[#F7F8F6] text-[#727A74] hover:text-[#252A27] transition-colors border border-[#E7EBE7]"
              title="Refresh Customer Store"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#173D30]' : ''}`} />
            </button>

            {/* Launch In Separate Browser Tab */}
            <button
              onClick={handleOpenExternal}
              className="px-3 py-2 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              title="Open In Separate Browser Window"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A16E]" />
              <span className="hidden md:inline">Open In New Tab</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white hover:bg-red-50 hover:text-red-600 text-[#727A74] transition-colors border border-[#E7EBE7]"
              title="Close Customer Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Live Iframe Body */}
        <div className="relative flex-1 bg-white overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-[#F7F8F6] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#E7EBE7] border-t-[#173D30] rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-[#727A74]">Connecting to customer storefront at port 5173...</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={customerWebViewerUrl}
            onLoad={() => setIsLoading(false)}
            title="Customer Storefront Live View"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Footer Prompt */}
        <div className="px-5 py-2.5 bg-[#FAF6F0] border-t border-[#E7EBE7] flex items-center justify-between text-[11px] text-[#727A74] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A16E]" />
            <span>Jarvis Sentinel is actively synchronizing with the customer storefront.</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[#727A74]">
            <span>Voice command: <b className="text-[#173D30]">"Jarvis, close customer web"</b></span>
          </div>
        </div>

      </div>
    </div>
  );
}
