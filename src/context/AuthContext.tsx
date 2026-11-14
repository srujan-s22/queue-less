'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { MOCK_USERS } from '@/data/mockData';
import { authApi } from '@/lib/api/services/authApi';
import { RegisterRequest } from '@/lib/api/types';

interface AuthContextType {
  user: User;
  role: Role;
  switchRole: (role: Role) => Promise<void>;
  login: (role: Role, email?: string, password?: string) => Promise<boolean>;
  registerStudent: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  student: { email: 'aarav.sharma@campus.edu', password: 'student123' },
  staff: { email: 'ramesh.canteen@campus.edu', password: 'staff123' },
  admin: { email: 'ananya.iyer@campus.edu', password: 'admin123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('student');
  const [user, setUser] = useState<User>(MOCK_USERS.student);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session from backend cookie on initial load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
        setRole(currentUser.role);
        setIsAuthenticated(true);
      } catch {
        // When session restoration fails (e.g. 401 unauthenticated), clear authenticated state.
        // Never silently re-authenticate a user into a demo session!
        setIsAuthenticated(false);
        setUser(MOCK_USERS.student);
        setRole('student');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const switchRole = async (newRole: Role) => {
    setIsLoading(true);
    try {
      const creds = DEMO_CREDENTIALS[newRole];
      const realUser = await authApi.login(creds);
      setUser(realUser);
      setRole(realUser.role);
      setIsAuthenticated(true);
    } catch (err) {
      console.warn(`[AuthContext] Backend login for ${newRole} failed, falling back to mock:`, err);
      const mockProfile = MOCK_USERS[newRole];
      setUser(mockProfile);
      setRole(newRole);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newRole: Role, email?: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const creds = {
        email: email || DEMO_CREDENTIALS[newRole].email,
        password: password || DEMO_CREDENTIALS[newRole].password,
      };

      const realUser = await authApi.login(creds);
      setUser(realUser);
      setRole(realUser.role);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await authApi.register(data);
      setUser(newUser);
      setRole('student');
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setIsAuthenticated(false);
      setUser(MOCK_USERS.student);
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
