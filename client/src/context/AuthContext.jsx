import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, updateProfileApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pm_user');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await loginApi(credentials);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await registerApi(userData);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pm_user');
  };

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const updated = await updateProfileApi(data);
      setUser(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);