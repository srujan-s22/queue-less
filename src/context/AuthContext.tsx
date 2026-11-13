'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { MOCK_USERS } from '@/data/mockData';
import { storage } from '@/services/storage';

interface AuthContextType {
  user: User;
  role: Role;
  switchRole: (role: Role) => void;
  login: (role: Role, email?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_ROLE_KEY = 'auth_current_role';
const CUSTOM_USER_KEY = 'auth_custom_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('student');
  const [user, setUser] = useState<User>(MOCK_USERS.student);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    queueMicrotask(() => {
      const savedRole = storage.get<Role>(CURRENT_ROLE_KEY, 'student');
      const customUser = storage.get<User | null>(CUSTOM_USER_KEY, null);

      setRole(savedRole);
      if (customUser && customUser.role === savedRole) {
        setUser(customUser);
      } else {
        setUser(MOCK_USERS[savedRole] || MOCK_USERS.student);
      }
      setIsInitialized(true);
    });
  }, []);

  const switchRole = (newRole: Role) => {
    setRole(newRole);
    storage.set(CURRENT_ROLE_KEY, newRole);
    const mockProfile = MOCK_USERS[newRole];
    setUser(mockProfile);
    storage.set(CUSTOM_USER_KEY, mockProfile);
  };

  const login = (newRole: Role, email?: string) => {
    const baseUser = MOCK_USERS[newRole];
    const loggedUser: User = {
      ...baseUser,
      email: email || baseUser.email,
    };
    setRole(newRole);
    setUser(loggedUser);
    setIsAuthenticated(true);
    storage.set(CURRENT_ROLE_KEY, newRole);
    storage.set(CUSTOM_USER_KEY, loggedUser);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateUser = (updates: Partial<User>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    storage.set(CUSTOM_USER_KEY, updated);
  };

  if (!isInitialized) {
    // Avoid hydration mismatch
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        switchRole,
        login,
        logout,
        updateUser,
        isAuthenticated,
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
