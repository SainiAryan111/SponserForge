import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import BrandDashboard from './pages/BrandDashboard.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CreateCampaignPage from './pages/CreateCampaignPage.jsx';
import CampaignDetailPage from './pages/CampaignDetailPage.jsx';
import ApplicationDetailPage from './pages/ApplicationDetailPage.jsx';
import PreviousWorkPage from './pages/PreviousWorkPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SearchUsersPage from './pages/SearchUsersPage.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

// Scroll To Top Component on Route Change (including Back/Forward navigation)
const ScrollToTop = () => {
  const { pathname, search, key } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search, key]);

  return null;
};

// Role-Aware Protected Route Guard for Authenticated Users
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

// Route Guard for Landing / Welcome Page: Redirects logged-in users to /dashboard
const HomeRouteGuard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <WelcomePage />;
};

// Route Guard for Guest Only pages (Login & Signup)
const GuestOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
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
        <ScrollToTop />
        <Routes>
          {/* Main Layout Wrap with Global Footer */}
          <Route element={<MainLayout />}>
            {/* Landing / Welcome Route: Logged-in users automatically redirect to /dashboard */}
            <Route path="/" element={<HomeRouteGuard />} />
            
            {/* Guest Only Auth Routes */}
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <Login />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestOnlyRoute>
                  <Signup />
                </GuestOnlyRoute>
              }
            />

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

            {/* Create Campaign Page */}
            <Route
              path="/campaign/create"
              element={
                <ProtectedRoute allowedRole="brand">
                  <CreateCampaignPage />
                </ProtectedRoute>
              }
            />

            {/* Campaign Detail Page */}
            <Route
              path="/campaign/:id"
              element={
                <ProtectedRoute>
                  <CampaignDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Application / Deal Detail Page */}
            <Route
              path="/application/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Previous Work & Deliverables Portfolio Page */}
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <PreviousWorkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/previous-work"
              element={
                <ProtectedRoute>
                  <PreviousWorkPage />
                </ProtectedRoute>
              }
            />

            {/* History Page */}
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Search Users Directory */}
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchUsersPage />
                </ProtectedRoute>
              }
            />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;