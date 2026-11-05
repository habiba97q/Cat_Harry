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
        setUser(data.data);
      } catch (error) {
        setUser(null);
        if (error.status !== 401) toast.error(error.message || 'Unable to restore your session');
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
      setUser(data.data);
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
      return data.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/google', { idToken });
      setUser(data.data);
      toast.success('Signed in with Google');
      return data.data;
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
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
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = { user, loading, login, register, googleLogin, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
