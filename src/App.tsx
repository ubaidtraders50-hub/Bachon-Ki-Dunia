/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { TopBrandBanner } from './components/layout/TopBrandBanner';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/common/CartDrawer';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Public Layout Wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-800">
      <TopBrandBanner />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};

// 404 Not Found Page
const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <h1 className="text-4xl font-black text-slate-900 font-['Outfit']">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The kid's outfit or page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <Routes>
              {/* Public Storefront Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="collections/summer" element={<CollectionPage />} />
                <Route path="collections/winter" element={<CollectionPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="track-order" element={<TrackOrderPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="policies/shipping" element={<PoliciesPage />} />
                <Route path="policies/returns" element={<PoliciesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Portal Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
