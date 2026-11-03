import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await api.login(usernameOrEmail, password);
    setToken(res.token);
    const userData = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role,
      emailVerified: res.emailVerified,
    };
    setUser(userData);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(userData));
    return res;
  };

  const register = async (username, email, password) => {
    return await api.register(username, email, password);
  };

  const verifyEmail = async (verificationToken) => {
    const res = await api.verifyEmail(verificationToken);
    if (user) {
      const updated = { ...user, emailVerified: true };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
    return res;
  };

  const forgotPassword = async (email) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (resetToken, newPassword) => {
    return await api.resetPassword(resetToken, newPassword);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const freshUser = await api.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isAdmin = user && user.role === 'ROLE_ADMIN';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
