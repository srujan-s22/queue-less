export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const ENDPOINTS = {
  // Authentication & Profile
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/users/profile',
    WALLET_TOPUP: '/users/wallet/topup',
  },
  // Menu & Catalog
  MENU: {
    BASE: '/menu',
    DETAIL: (id: string) => `/menu/${id}`,
    AVAILABILITY: (id: string) => `/menu/${id}/availability`,
  },
  // Pickup Slots
  SLOTS: {
    BASE: '/slots',
    DETAIL: (id: string) => `/slots/${id}`,
    SEED: '/slots/seed',
  },
  // Orders
  ORDERS: {
    BASE: '/orders',
    MY_ORDERS: '/orders/my-orders',
    DETAIL: (id: string) => `/orders/${id}`,
    STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  // Kitchen Staff Command Center
  STAFF: {
    DASHBOARD: '/staff/dashboard',
    INCOMING: '/staff/incoming',
    PREPARATION: '/staff/preparation',
    READY: '/staff/ready',
    HANDOVER: (id: string) => `/staff/orders/${id}/handover`,
  },
  // Administration & Analytics
  ADMIN: {
    ORDERS: '/admin/orders',
  },
  SETTINGS: {
    BASE: '/settings',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    EXPORT_CSV: '/analytics/export-csv',
  },
  HEALTH: '/health',
} as const;
