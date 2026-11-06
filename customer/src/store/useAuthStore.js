import { create } from 'zustand';
import { authService } from '../services/api';
import { useCartStore } from './useCartStore';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('varshi_customer_user') || 'null'),
  token: localStorage.getItem('varshi_customer_token') || null,
  isAuthenticated: !!localStorage.getItem('varshi_customer_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('varshi_customer_token', data.access_token);
      localStorage.setItem('varshi_customer_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Synchronize any guest items (e.g. shoe added via Buy Now before login) to the user's backend cart
      try {
        await useCartStore.getState().syncGuestCartToServer();
      } catch (e) {
        console.warn('Could not sync guest cart on login:', e);
      }

      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      localStorage.setItem('varshi_customer_token', data.access_token);
      localStorage.setItem('varshi_customer_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
      });

      try {
        await useCartStore.getState().syncGuestCartToServer();
      } catch (e) {
        console.warn('Could not sync guest cart on register:', e);
      }

      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await authService.updateProfile(userData);
      localStorage.setItem('varshi_customer_user', JSON.stringify(updated));
      set({ user: updated, isLoading: false });
      return updated;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('varshi_customer_token');
    localStorage.removeItem('varshi_customer_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
