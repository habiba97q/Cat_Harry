"use client";
// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        // Not authenticated – keep user null
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setUser(data.user);
      toast.success('Logged in successfully');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', payload);
      setUser(data.user);
      toast.success('Registered successfully');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out');
    } catch (err) {
      toast.error(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
