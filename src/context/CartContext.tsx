'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, OrderItem } from '@/types';
import { storage } from '@/services/storage';
import { configService } from '@/services/configService';
import { menuService } from '@/services/menuService';

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
    queueMicrotask(() => {
      const saved = storage.get<OrderItem[]>(CART_STORAGE_KEY, []);
      setItems(saved);
      setIsLoaded(true);

      // Reconcile legacy or stale cart items against authoritative menu
      if (saved.length > 0) {
        menuService
          .fetchMenuItems()
          .then((liveMenu) => {
            if (!liveMenu || liveMenu.length === 0) return;

            let hasChanges = false;
            const reconciled = saved.map((cartItem) => {
              let liveMatch: MenuItem | undefined;

              if (cartItem.menuItem.id.startsWith('menu_')) {
                // Match by canonical dish name
                liveMatch = liveMenu.find(
                  (m) => m.name.toLowerCase() === cartItem.menuItem.name.toLowerCase()
                );
                // Or fallback to numeric index
                if (!liveMatch) {
                  const idx = parseInt(cartItem.menuItem.id.replace('menu_', ''), 10) - 1;
                  if (idx >= 0 && idx < liveMenu.length) {
                    liveMatch = liveMenu[idx];
                  }
                }
              } else {
                liveMatch = liveMenu.find((m) => m.id === cartItem.menuItem.id);
              }

              if (
                liveMatch &&
                (liveMatch.id !== cartItem.menuItem.id ||
                  liveMatch.price !== cartItem.menuItem.price ||
                  liveMatch.isAvailable !== cartItem.menuItem.isAvailable)
              ) {
                hasChanges = true;
                return {
                  ...cartItem,
                  menuItem: {
                    ...cartItem.menuItem,
                    id: liveMatch.id,
                    price: liveMatch.price,
                    isAvailable: liveMatch.isAvailable,
                  },
                };
              }
              return cartItem;
            });

            if (hasChanges) {
              setItems(reconciled);
              storage.set(CART_STORAGE_KEY, reconciled);
            }
          })
          .catch((err) => {
            console.warn('[CartContext] Failed to reconcile cart with live menu:', err);
          });
      }
    });
  }, []);

  const saveItems = (newItems: OrderItem[]) => {
    setItems(newItems);
    storage.set(CART_STORAGE_KEY, newItems);
  };

  const addItem = (menuItem: MenuItem, quantity = 1, customizations?: string[]) => {
    // If menuItem has a legacy mock ID, try to resolve to authoritative live menu item
    let authoritativeItem = menuItem;
    if (menuItem.id.startsWith('menu_')) {
      const liveItems = menuService.getAll();
      const liveMatch = liveItems.find(
        (m) =>
          m.name.toLowerCase() === menuItem.name.toLowerCase() &&
          !m.id.startsWith('menu_')
      );
      if (liveMatch) {
        authoritativeItem = liveMatch;
      }
    }

    const existingIndex = items.findIndex(
      (i) =>
        i.menuItem.id === authoritativeItem.id ||
        (i.menuItem.name.toLowerCase() === authoritativeItem.name.toLowerCase() &&
          (i.menuItem.id.startsWith('menu_') || authoritativeItem.id.startsWith('menu_')))
    );
    let updated: OrderItem[];

    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].menuItem = authoritativeItem;
      updated[existingIndex].quantity += quantity;
      if (customizations && customizations.length > 0) {
        updated[existingIndex].customizations = customizations;
      }
    } else {
      updated = [...items, { menuItem: authoritativeItem, quantity, customizations }];
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
