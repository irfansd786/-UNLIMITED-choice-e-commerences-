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

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('varshi_customer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Unified error response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    let message = Array.isArray(detail)
      ? detail.map(d => d.msg || d.message).join(', ')
      : detail || error.message || 'An unexpected error occurred. Please try again.';
    
    // Auto logout and friendly message on 401
    if (error.response?.status === 401) {
      message = 'Please sign in to proceed';
      if (localStorage.getItem('varshi_customer_token')) {
        localStorage.removeItem('varshi_customer_token');
        localStorage.removeItem('varshi_customer_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (userData) => {
    const res = await api.put('/auth/me', userData);
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return res.data;
  },
};

export const categoryService = {
  getAll: async (featuredOnly = false) => {
    const res = await api.get('/categories', { params: { featured_only: featuredOnly } });
    return res.data;
  },
  getBySlug: async (slug) => {
    const res = await api.get(`/categories/${slug}`);
    return res.data;
  },
};

export const productService = {
  getAll: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getBySlugOrId: async (slugOrId) => {
    const res = await api.get(`/products/${slugOrId}`);
    return res.data;
  },
  getRelated: async (productId) => {
    const res = await api.get(`/products/${productId}/related`);
    return res.data;
  },
  getSearchSuggestions: async (q) => {
    const res = await api.get('/products/search/suggestions', { params: { q } });
    return res.data;
  },
};

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },
  addItem: async (productId, quantity = 1) => {
    const res = await api.post('/cart/items', { product_id: productId, quantity });
    return res.data;
  },
  updateQuantity: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },
  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },
  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data;
  },
};

export const wishlistService = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },
  toggleItem: async (productId) => {
    const res = await api.post(`/wishlist/toggle/${productId}`);
    return res.data;
  },
  removeItem: async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
  },
};

export const addressService = {
  getAll: async () => {
    const res = await api.get('/addresses');
    return res.data;
  },
  create: async (addressData) => {
    const res = await api.post('/addresses', addressData);
    return res.data;
  },
  update: async (addressId, addressData) => {
    const res = await api.put(`/addresses/${addressId}`, addressData);
    return res.data;
  },
  setDefault: async (addressId) => {
    const res = await api.patch(`/addresses/${addressId}/default`);
    return res.data;
  },
  delete: async (addressId) => {
    const res = await api.delete(`/addresses/${addressId}`);
    return res.data;
  },
};

export const orderService = {
  create: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  getByIdOrNumber: async (idOrNumber) => {
    const res = await api.get(`/orders/${idOrNumber}`);
    return res.data;
  },
  cancel: async (orderId, reason) => {
    const res = await api.post(`/orders/${orderId}/cancel`, null, { params: { reason } });
    return res.data;
  },
  requestReturn: async (orderId, reason) => {
    const res = await api.post(`/orders/${orderId}/request-return`, null, { params: { reason } });
    return res.data;
  },
};

export const reviewService = {
  getByProduct: async (productId) => {
    const res = await api.get(`/reviews/product/${productId}`);
    return res.data;
  },
  create: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },
};

export const couponService = {
  validate: async (code, cartAmount) => {
    const res = await api.post('/coupons/validate', { code, cart_amount: cartAmount });
    return res.data;
  },
};

export default api;
