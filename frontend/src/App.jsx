import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Footer from './components/Footer.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Layout component ensuring the Footer stays at the bottom across all pages
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <main className="flex-grow">
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
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
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