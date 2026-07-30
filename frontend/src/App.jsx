import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import PresentationDeck from './pages/PresentationDeck.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import BrandDashboard from './pages/BrandDashboard.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

// Role-Aware Protected Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check role authorization if specified
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Smart Redirector for generic /dashboard path
const DashboardRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user.role === 'brand') {
    return <Navigate to="/brand/dashboard" replace />;
  }
  return <Navigate to="/creator/dashboard" replace />;
};

// Layout component ensuring the Footer stays at the bottom across all pages
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Layout Wrap with Global Footer */}
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/deck" element={<PresentationDeck />} />

            {/* Dynamic Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Brand Dashboard */}
            <Route
              path="/brand/dashboard"
              element={
                <ProtectedRoute allowedRole="brand">
                  <BrandDashboard />
                </ProtectedRoute>
              }
            />

            {/* Creator Dashboard */}
            <Route
              path="/creator/dashboard"
              element={
                <ProtectedRoute allowedRole="creator">
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile Page (accessible by both roles) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes back to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;