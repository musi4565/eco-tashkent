import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const login = useCallback(async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    return data.user;
  }, []);

  const register = useCallback(async (name, phone, password) => {
    const { data } = await api.post('/auth/register', { name, phone, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data && data.user && typeof data.user === 'object') {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch {
      /* token eskirgan bo'lsa indamay o'tib ketamiz */
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
