// src/pages/Dashboard.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BrandDashboard from './BrandDashboard';
import CreatorDashboard from './CreatorDashboard';

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render dashboard based on role
  if (user?.role === 'brand') {
    return <BrandDashboard />;
  }

  return <CreatorDashboard />;
}