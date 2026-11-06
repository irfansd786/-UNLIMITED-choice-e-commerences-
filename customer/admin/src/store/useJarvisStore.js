import { create } from 'zustand';

export const useJarvisStore = create((set, get) => ({
  isOnline: true,
  isListening: false,
  isRecognizing: false,
  isSpeaking: false,
  isProcessing: false,
  isInConversation: false,
  isMuted: false,
  isHudMinimized: false,
  greetingSpoken: false,
  
  micPermission: 'prompt', // 'prompt' | 'granted' | 'denied'
  hasActivatedVoice: false,
  
  lastHeard: '',
  liveTranscript: '',
  lastResponse: '',
  currentSpeakingText: '',
  
  customerWebStatus: {
    customerOnline: true,
    backendOnline: true,
    latencyMs: 12,
    productCount: 39,
    timestamp: new Date(),
    summary: 'Customer web page is active and online at localhost 5173.'
  },

  // Interactive Product Builder State (Voice-driven)
  showProductBuilder: false,
  activeProductDraft: null,
  isPublishingProduct: false,

  // Interactive Coupon Studio State (Voice-driven)
  showCouponModal: false,
  activeCouponDraft: null,
  isSavingCoupon: false,

  // Live Customer Web In-App Viewer State (Voice-driven)
  showCustomerWebViewer: false,
  customerWebViewerUrl: 'http://localhost:5173',
  customerWebViewerTitle: 'Customer Store Home',

  setListening: (status) => set({ isListening: status }),
  setRecognizing: (status) => set({ isRecognizing: status }),
  setSpeaking: (status) => set({ isSpeaking: status }),
  setProcessing: (status) => set({ isProcessing: status }),
  
  setInConversation: (status) => set({ isInConversation: status }),
  setMicPermission: (permission) => set({ micPermission: permission }),
  setHasActivatedVoice: (val) => set({ hasActivatedVoice: val }),
  
  setLastHeard: (text) => set({ lastHeard: text }),
  setLiveTranscript: (text) => set({ liveTranscript: text }),
  setLastResponse: (text) => set({ lastResponse: text }),
  setCurrentSpeakingText: (text) => set({ currentSpeakingText: text }),

  stopSpeaking: () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    set({ isSpeaking: false, currentSpeakingText: '' });
  },
  
  setCustomerWebStatus: (statusObj) => set({ customerWebStatus: statusObj }),
  setGreetingSpoken: (val) => set({ greetingSpoken: val }),
  
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleHudMinimize: () => set((state) => ({ isHudMinimized: !state.isHudMinimized })),
  setHudMinimized: (val) => set({ isHudMinimized: val }),

  openProductBuilder: (draft) => set({
    showProductBuilder: true,
    activeProductDraft: draft
  }),

  updateProductDraft: (fields) => set((state) => ({
    activeProductDraft: { ...state.activeProductDraft, ...fields }
  })),

  closeProductBuilder: () => set({
    showProductBuilder: false,
    activeProductDraft: null,
    isPublishingProduct: false
  }),

  setPublishingProduct: (val) => set({ isPublishingProduct: val }),

  openCouponModal: (draft) => set({
    showCouponModal: true,
    activeCouponDraft: draft,
    isSavingCoupon: false
  }),

  updateCouponDraft: (fields) => set((state) => ({
    activeCouponDraft: { ...state.activeCouponDraft, ...fields }
  })),

  closeCouponModal: () => set({
    showCouponModal: false,
    activeCouponDraft: null,
    isSavingCoupon: false
  }),

  setSavingCoupon: (val) => set({ isSavingCoupon: val }),

  openCustomerWebViewer: (url, title = 'Live Customer Store') => set({
    showCustomerWebViewer: true,
    customerWebViewerUrl: url || 'http://localhost:5173',
    customerWebViewerTitle: title
  }),

  closeCustomerWebViewer: () => set({
    showCustomerWebViewer: false
  }),
}));
