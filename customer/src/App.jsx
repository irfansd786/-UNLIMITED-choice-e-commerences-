import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/ToastContainer';
import { FlyAnimationProvider } from './context/FlyAnimationContext';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Shoes from './pages/Shoes';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetails from './pages/ProductDetails';
import ProductStudio from './pages/ProductStudio';
import OutfitStudio from './pages/OutfitStudio';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderPage from './pages/OrderPage';
import InvoicePrinter from './pages/printer';
import Wishlist from './pages/Wishlist';
import Reviews from './pages/Reviews';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import AccountLayout from './pages/account/AccountLayout';
import Profile from './pages/account/Profile';
import Orders from './pages/account/Orders';
import OrderDetails from './pages/account/OrderDetails';
import Addresses from './pages/account/Addresses';

import About from './pages/static/About';
import Contact from './pages/static/Contact';
import FAQ from './pages/static/FAQ';
import ReturnPolicy from './pages/static/ReturnPolicy';
import LegalPrivacy from './pages/static/LegalPrivacy';
import Terms from './pages/static/Terms';
import NotFound from './pages/static/NotFound';

// Unified Admin Components & Pages (Single Port Architecture)
import AdminLayout from './admin/components/layout/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import ProductsManagement from './admin/pages/ProductsManagement';
import CategoryManagement from './admin/pages/CategoryManagement';
import InventoryManagement from './admin/pages/InventoryManagement';
import OrderManagement from './admin/pages/OrderManagement';
import CustomerManagement from './admin/pages/CustomerManagement';
import ReviewManagement from './admin/pages/ReviewManagement';
import CouponManagement from './admin/pages/CouponManagement';
import Settings from './admin/pages/Settings';
import { useAdminAuthStore } from './admin/store/useAdminAuthStore';

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
  const storedUser = JSON.parse(localStorage.getItem('varshi_admin_user') || localStorage.getItem('varshi_customer_user') || 'null');
  const storedToken = localStorage.getItem('varshi_admin_token') || localStorage.getItem('varshi_customer_token');
  const isAdmin = (isAuthenticated && user?.role === 'ADMIN') || (storedToken && storedUser?.role === 'ADMIN');

  if (!isAdmin) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }
  return children;
}

function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-charcoal-900 selection:bg-forest-100 selection:text-forest-900 font-sans m-0 p-0">
      <Header />
      <main className="flex-1 m-0 p-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FlyAnimationProvider>
          <Routes>
            {/* UNIFIED ADMIN CONSOLE ROUTES (Single Port: http://localhost:5173/admin) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
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

            {/* CUSTOMER STOREFRONT ROUTES */}
            <Route element={<CustomerLayout />}>
              {/* 1. Home */}
              <Route path="/" element={<Home />} />

              {/* 5. Products & Collections */}
              <Route path="/shoes" element={<Shoes />} />
              <Route path="/sneakers" element={<Shoes />} />
              <Route path="/category/shoes" element={<Shoes />} />
              <Route path="/products" element={<Products />} />
              <Route path="/collection" element={<Products />} />

              {/* 6. Category Products */}
              <Route path="/category/:slug" element={<CategoryProducts />} />

              {/* 8. Product Details */}
              <Route path="/products/:slug" element={<ProductDetails />} />

              {/* 8.5 Interactive 360° Product Studio */}
              <Route path="/studio/:slug" element={<ProductStudio />} />
              <Route path="/products/:slug/360" element={<ProductStudio />} />

              {/* 8.6 Interactive Men's Outfit Studio */}
              <Route path="/outfit-studio" element={<OutfitStudio />} />

              {/* 9. Wishlist */}
              <Route path="/wishlist" element={<Wishlist />} />

              {/* 10. Cart & Add to Cart Page */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/add-to-cart" element={<Cart />} />

              {/* 10.5 Dedicated Orders Page */}
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/order" element={<OrderPage />} />

              {/* 11. Checkout & 12. Mock Payment */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Checkout />} />

              {/* 13. Order Confirmation */}
              <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />

              {/* Lightswind Invoice Printer Route (Thermal POS) */}
              <Route path="/printer" element={<div className="py-12 bg-neutral-950 min-h-screen flex items-center justify-center"><InvoicePrinter format="thermal" /></div>} />

              {/* 18. Customer Reviews */}
              <Route path="/reviews" element={<Reviews />} />

              {/* 2, 3, 4. Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* 14, 15, 16, 17. Protected Customer Account Dashboard */}
              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<Profile />} />
                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderIdOrNumber" element={<OrderDetails />} />
                <Route path="addresses" element={<Addresses />} />
              </Route>

              {/* 19, 20, 21, 22, 23, 24. Static / Policy Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/privacy-policy" element={<LegalPrivacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* 25. 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <ToastContainer />
        </FlyAnimationProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
