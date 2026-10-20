import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bkd_admin_token');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const verifyCurrentToken = async (activeToken: string) => {
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
      } else {
        // Expired or invalid
        logout();
      }
    } catch {
      // keep token for offline / network transient
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyCurrentToken(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      setToken(data.token);
      setAdmin(data.admin);
      try {
        localStorage.setItem('bkd_admin_token', data.token);
      } catch (err) {
        console.error('Failed to store token', err);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Connection error during sign-in' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    try {
      localStorage.removeItem('bkd_admin_token');
    } catch (err) {
      console.error('Failed to remove token', err);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        isLoading,
        login,
        logout,
        getAuthHeaders,
      }}
    >
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
