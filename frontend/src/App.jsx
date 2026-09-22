import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import DeliveryTrackingPage from './pages/DeliveryTrackingPage';
import HowItWorksPage from './pages/info/HowItWorksPage';
import AboutPage from './pages/info/AboutPage';
import ContactPage from './pages/info/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderEquipment from './pages/provider/ProviderEquipment';
import ProviderAddEquipment from './pages/provider/ProviderAddEquipment';
import ProviderAnalytics from './pages/provider/ProviderAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    {/* Public Core Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/equipment" element={<MarketplacePage />} />
                    <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/delivery/:orderId" element={<DeliveryTrackingPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Authentication */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/signup" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Customer Protected Routes */}
                    <Route
                      path="/customer/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['customer', 'admin']}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/customer"
                      element={
                        <ProtectedRoute allowedRoles={['customer', 'admin']}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/rentals"
                      element={
                        <ProtectedRoute allowedRoles={['customer', 'admin']}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/history"
                      element={
                        <ProtectedRoute allowedRoles={['customer', 'admin']}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Provider Protected Routes */}
                    <Route
                      path="/provider/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['provider', 'admin']}>
                          <ProviderDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/provider"
                      element={
                        <ProtectedRoute allowedRoles={['provider', 'admin']}>
                          <ProviderDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/provider/equipment"
                      element={
                        <ProtectedRoute allowedRoles={['provider', 'admin']}>
                          <ProviderEquipment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/provider/equipment/add"
                      element={
                        <ProtectedRoute allowedRoles={['provider', 'admin']}>
                          <ProviderAddEquipment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/provider/analytics"
                      element={
                        <ProtectedRoute allowedRoles={['provider', 'admin']}>
                          <ProviderAnalytics />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback 404 */}
                    <Route path="*" element={<LandingPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
