import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminAuthStore } from './store/useAdminAuthStore';

import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ProductsManagement from './pages/ProductsManagement';
import CategoryManagement from './pages/CategoryManagement';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import ReviewManagement from './pages/ReviewManagement';
import CouponManagement from './pages/CouponManagement';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, user } = useAdminAuthStore();
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const basename = import.meta.env.BASE_URL || '/admin/';
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
