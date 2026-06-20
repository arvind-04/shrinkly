import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shrinkly_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem('shrinkly_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('shrinkly_token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('shrinkly_token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('shrinkly_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
