'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};
