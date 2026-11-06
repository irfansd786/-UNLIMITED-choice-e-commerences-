import { create } from 'zustand';
import { adminAuthService } from '../services/api';

export const useAdminAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('varshi_admin_user') || 'null'),
  token: localStorage.getItem('varshi_admin_token') || null,
  isAuthenticated: !!localStorage.getItem('varshi_admin_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminAuthService.login(email, password);
      localStorage.setItem('varshi_admin_token', data.access_token);
      localStorage.setItem('varshi_admin_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('varshi_admin_token');
    localStorage.removeItem('varshi_admin_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
