'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { authApi } from '@/lib/api/services/authApi';
import { RegisterRequest } from '@/lib/api/types';
import { getAuthToken, clearAuthToken } from '@/lib/api/token';
import { updateSocketAuth, disconnectSocket } from '@/lib/socket/socketClient';

interface AuthContextType {
  user: User;
  role: Role;
  switchRole: (role: Role) => Promise<void>;
  login: (roleOrEmail: Role | string, emailOrPassword?: string, maybePassword?: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  registerStudent: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_USER: User = {
  id: '',
  name: '',
  email: '',
  role: 'student',
  walletBalance: 0,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('student');
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session from backend cookie or stored token on initial load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await authApi.getMe();
        if (currentUser && currentUser.id) {
          setUser(currentUser);
          setRole(currentUser.role);
          setIsAuthenticated(true);
          updateSocketAuth(getAuthToken());
        } else {
          setIsAuthenticated(false);
          setUser(EMPTY_USER);
          clearAuthToken();
          disconnectSocket();
        }
      } catch {
        // When session restoration fails (e.g. 401 unauthenticated), clear authenticated state.
        setIsAuthenticated(false);
        setUser(EMPTY_USER);
        setRole('student');
        clearAuthToken();
        disconnectSocket();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const switchRole = async (newRole: Role) => {
    // If not authenticated, simply switch role context for UI preview
    setRole(newRole);
  };

  const login = async (
    roleOrEmail: Role | string,
    emailOrPassword?: string,
    maybePassword?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      let email = '';
      let password = '';

      if (maybePassword !== undefined) {
        // Called as login(role, email, password)
        email = emailOrPassword || '';
        password = maybePassword || '';
      } else {
        // Called as login(email, password)
        email = roleOrEmail;
        password = emailOrPassword || '';
      }

      const realUser = await authApi.login({ email, password });
      setUser(realUser);
      setRole(realUser.role);
      setIsAuthenticated(true);
      updateSocketAuth(getAuthToken());
      return realUser;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authApi.register(data);
      setUser(newUser);
      setRole(newUser.role);
      setIsAuthenticated(true);
      updateSocketAuth(getAuthToken());
      return newUser;
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: RegisterRequest): Promise<boolean> => {
    await register({ ...data, role: 'student' });
    return true;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[AuthContext] Logout failed:', err);
    } finally {
      clearAuthToken();
      disconnectSocket();
      setIsAuthenticated(false);
      setUser(EMPTY_USER);
      setRole('student');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const updated = await authApi.updateProfile(updates);
      setUser(updated);
    } catch (error) {
      console.error('[AuthContext] Update user failed:', error);
      // Optimistic local update
      setUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const refreshUser = async () => {
    try {
      const refreshed = await authApi.getMe();
      setUser(refreshed);
      setRole(refreshed.role);
    } catch (error) {
      console.warn('[AuthContext] Refresh user failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        switchRole,
        login,
        register,
        registerStudent,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated,
        isLoading,
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
