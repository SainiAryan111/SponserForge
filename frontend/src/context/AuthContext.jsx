import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');

    if (token) {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Keep user state fresh from backend
      api.get('auth/profile/')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user_data', JSON.stringify(res.data));
        })
        .catch((err) => {
          console.warn('Could not refresh profile on mount:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password, role) => {
    const response = await api.post('auth/login/', { username, password, role });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Extract user profile returned from login endpoint
    const userPayload = response.data.user || response.data;
    localStorage.setItem('user_data', JSON.stringify(userPayload));
    setUser(userPayload);
    
    return response.data;
  };

  const loginWithGoogle = async (credential, role, details = {}) => {
    const response = await api.post('auth/google/', { credential, role, ...details });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    const userPayload = response.data.user || response.data;
    localStorage.setItem('user_data', JSON.stringify(userPayload));
    setUser(userPayload);
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};