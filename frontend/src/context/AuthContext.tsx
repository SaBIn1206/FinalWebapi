'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (name: string, email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('bakeryHubToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/auth/profile');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem('bakeryHubToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('bakeryHubToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('bakeryHubToken', token);
      setUser(userData);
      return userData;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('bakeryHubToken', token);
      setUser(userData);
      return userData;
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bakeryHubToken');
    setUser(null);
  };

  const updateUser = async (name: string, email: string) => {
    try {
      const res = await API.put('/auth/profile', { name, email });
      if (res.data && res.data.success) {
        setUser(prev => prev ? { ...prev, name: res.data.user.name, email: res.data.user.email } : null);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
