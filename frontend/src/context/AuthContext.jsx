import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const readStoredSession = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  return {
    token,
    user: storedUser ? JSON.parse(storedUser) : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession());

    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    setSession({ token, user: user || null });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSession({ token: null, user: null });
  };

  const value = {
    token: session.token,
    user: session.user,
    isAuthenticated: Boolean(session.token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};