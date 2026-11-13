'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, OrderItem } from '@/types';
import { storage } from '@/services/storage';
import { configService } from '@/services/configService';

interface CartContextType {
  items: OrderItem[];
  addItem: (menuItem: MenuItem, quantity?: number, customizations?: string[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  packagingFee: number;
  total: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get<OrderItem[]>(CART_STORAGE_KEY, []);
    setItems(saved);
    setIsLoaded(true);
  }, []);

  const saveItems = (newItems: OrderItem[]) => {
    setItems(newItems);
    storage.set(CART_STORAGE_KEY, newItems);
  };

  const addItem = (menuItem: MenuItem, quantity = 1, customizations?: string[]) => {
    const existingIndex = items.findIndex((i) => i.menuItem.id === menuItem.id);
    let updated: OrderItem[];

    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
      if (customizations && customizations.length > 0) {
        updated[existingIndex].customizations = customizations;
      }
    } else {
      updated = [...items, { menuItem, quantity, customizations }];
    }
    saveItems(updated);
  };

  const removeItem = (itemId: string) => {
    const updated = items.filter((i) => i.menuItem.id !== itemId);
    saveItems(updated);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const updated = items.map((i) =>
      i.menuItem.id === itemId ? { ...i, quantity } : i
    );
    saveItems(updated);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const subtotal = items.reduce((acc, i) => acc + i.menuItem.price * i.quantity, 0);
  const config = configService.getConfig();
  const tax = Math.round((subtotal * config.taxRatePercent) / 100);
  const packagingFee = items.length > 0 ? config.packagingCharge : 0;
  const total = subtotal + tax + packagingFee;
  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

  if (!isLoaded) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        packagingFee,
        total,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
