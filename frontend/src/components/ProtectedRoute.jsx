import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRole }) {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role'); // Saved during login/signup

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to their appropriate dashboard if they try to access the wrong role's page
    return <Navigate to={userRole === 'brand' ? '/brand/dashboard' : '/creator/dashboard'} replace />;
  }

  return <Outlet />;
}