import { create } from 'zustand';

export const useAIAssistantStore = create((set) => ({
  isOpen: false,
  queuedPrompt: '',
  activeConversationId: null,

  openAssistant: (initialPrompt = '') => set({ 
    isOpen: true, 
    queuedPrompt: initialPrompt || '' 
  }),
  
  closeAssistant: () => set({ isOpen: false }),
  
  toggleAssistant: () => set((state) => ({ isOpen: !state.isOpen })),

  setQueuedPrompt: (prompt) => set({ queuedPrompt: prompt }),
  
  clearQueuedPrompt: () => set({ queuedPrompt: '' }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));

