import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, firstName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response: AuthResponse = await authService.login({ username, password });
    authService.setAuthData(response);
    setUser({
      id: response.userId,
      username: response.username,
      firstName: response.firstName,
    });
  };

  const register = async (username: string, password: string, firstName: string) => {
    const response: AuthResponse = await authService.register({ username, password, firstName });
    authService.setAuthData(response);
    setUser({
      id: response.userId,
      username: response.username,
      firstName: response.firstName,
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

