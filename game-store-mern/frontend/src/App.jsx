import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy-load admin pages so they're only evaluated when routes match
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminGames = lazy(() => import('./pages/admin/AdminGames'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

// Initialize Stripe (cache across HMR to keep Elements `stripe` prop stable)
function getStripePromise() {
  if (typeof window !== 'undefined') {
    if (!window.__STRIPE_PROMISE__) {
      window.__STRIPE_PROMISE__ = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
    return window.__STRIPE_PROMISE__;
  }
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
}

function App() {
  // Memoize to avoid recreating the promise during re-renders
  const stripePromise = useMemo(() => getStripePromise(), []);
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/games/:slug" element={<GameDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  
                  {/* Protected routes */}
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <Suspense fallback={<div className="p-6">Loading admin…</div>}>
                        <AdminDashboard />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="/admin/games" element={
                    <AdminRoute>
                      <Suspense fallback={<div className="p-6">Loading admin…</div>}>
                        <AdminGames />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <Suspense fallback={<div className="p-6">Loading admin…</div>}>
                        <AdminOrders />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <Suspense fallback={<div className="p-6">Loading admin…</div>}>
                        <AdminUsers />
                      </Suspense>
                    </AdminRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </Elements>
    </Router>
  );
}

export default App;