import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://unlimited-choice-backend.onrender.com/api'
    : 'http://localhost:8000/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('varshi_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map(d => d.msg || d.message).join(', ')
      : detail || error.message || 'An error occurred';
    
    if (error.response?.status === 401 && localStorage.getItem('varshi_admin_token')) {
      localStorage.removeItem('varshi_admin_token');
      localStorage.removeItem('varshi_admin_user');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export const adminAuthService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.user.role !== 'ADMIN') {
      throw new Error('Access denied. Administrator privileges required.');
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const adminDashboardService = {
  getStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
};

export const adminProductService = {
  getAll: async (params = {}) => {
    const res = await api.get('/products', { params: { ...params, include_all_statuses: true } });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  create: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },
  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },
  updateStock: async (id, stock) => {
    const res = await api.patch(`/products/${id}/stock`, null, { params: { stock } });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export const adminCategoryService = {
  getAll: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  create: async (categoryData) => {
    const res = await api.post('/categories', categoryData);
    return res.data;
  },
  update: async (id, categoryData) => {
    const res = await api.put(`/categories/${id}`, categoryData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

export const adminInventoryService = {
  getAll: async (lowStockOnly = false) => {
    const res = await api.get('/admin/inventory', { params: { low_stock_only: lowStockOnly } });
    return res.data;
  },
};

export const adminOrderService = {
  getAll: async (params = {}) => {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },
  updateStatus: async (orderId, status, note) => {
    const res = await api.patch(`/admin/orders/${orderId}/status`, { status, note });
    return res.data;
  },
};

export const adminCustomerService = {
  getAll: async () => {
    const res = await api.get('/admin/customers');
    return res.data;
  },
};

export const adminReviewService = {
  getAll: async () => {
    const res = await api.get('/reviews/admin');
    return res.data;
  },
  updateStatus: async (id, statusVal) => {
    const res = await api.patch(`/reviews/admin/${id}/status`, null, { params: { status_val: statusVal } });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reviews/admin/${id}`);
    return res.data;
  },
};

export const adminCouponService = {
  getAll: async () => {
    const res = await api.get('/coupons');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/coupons', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/coupons/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  },
};

export const adminAIService = {
  getBriefing: async (offsetMinutes = 330) => {
    const res = await api.get('/admin/ai/briefing', { params: { offset_minutes: offsetMinutes } });
    return res.data;
  },
  sendChatMessage: async (message, conversationId = null, offsetMinutes = 330) => {
    const res = await api.post('/admin/ai/chat', {
      message,
      conversation_id: conversationId,
      offset_minutes: offsetMinutes
    });
    return res.data;
  },
  sendVoiceChat: async (audioBlob, conversationId = null, offsetMinutes = 330) => {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }
    formData.append('offset_minutes', offsetMinutes);

    const res = await api.post('/admin/ai/voice/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  executeAction: async (actionType, payload, conversationId = null) => {
    const res = await api.post('/admin/ai/execute-action', {
      action_type: actionType,
      payload,
      conversation_id: conversationId,
    });
    return res.data;
  },
  getConversations: async () => {
    const res = await api.get('/admin/ai/conversations');
    return res.data;
  },
  getConversation: async (id) => {
    const res = await api.get(`/admin/ai/conversations/${id}`);
    return res.data;
  },
  deleteConversation: async (id) => {
    const res = await api.delete(`/admin/ai/conversations/${id}`);
    return res.data;
  },
};

export default api;
