import ScrollToTop from './components/ScrollToTop';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ApprovedOnlyRoute from './components/ApprovedOnlyRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstallationGuide from './pages/InstallationGuide';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function CustomerOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

/* ── Routes that use a full-screen layout without the site footer ── */
const NO_FOOTER_ROUTES = [
  '/admin',              // entire admin console
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',     // matches /reset-password/:token via prefix
];

function AppRoutes() {
  const location = useLocation();

  const hideFooter = NO_FOOTER_ROUTES.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <div key={location.pathname} className="route-fade">
          <Routes location={location}>
            <Route path="/" element={<CustomerOnlyRoute><Home /></CustomerOnlyRoute>} />
            <Route path="/products" element={<CustomerOnlyRoute><Products /></CustomerOnlyRoute>} />
            <Route path="/product/:id" element={<CustomerOnlyRoute><ProductDetail /></CustomerOnlyRoute>} />

            {/* auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* legal */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* protected */}
            <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/guide" element={<ApprovedOnlyRoute><InstallationGuide /></ApprovedOnlyRoute>} />

            {/* admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}