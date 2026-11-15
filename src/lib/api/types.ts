import { User, MenuItem, PickupSlot, Order, CanteenConfig, Role } from '@/types';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
  errors?: { field: string; message: string }[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
  studentId?: string;
  department?: string;
  phone?: string;
  accessKey?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  department?: string;
}

export interface WalletTopupRequest {
  amount: number;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  category: 'breakfast' | 'meals' | 'quick-bites' | 'beverages' | 'desserts';
  price: number;
  dietary: 'veg' | 'non-veg' | 'vegan';
  prepTimeMinutes?: number;
  imageUrl: string;
  isAvailable?: boolean;
  isSpecial?: boolean;
  calories?: number;
  allergens?: string[];
  addons?: { name: string; price: number }[];
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {}

export interface CreateOrderRequest {
  pickupSlotId: string;
  items: {
    menuItemId: string;
    quantity: number;
    selectedAddons?: { name: string; price: number }[];
  }[];
  paymentMethod?: 'counter_cash' | 'campus_wallet' | 'upi';
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  rejectionReason?: string;
}

export interface StaffDashboardMetrics {
  incoming: number;
  cooking: number;
  ready: number;
  completedToday: number;
}

export interface AdminAnalyticsMetrics {
  overview: {
    totalRevenue: number;
    subtotalRevenue: number;
    lateFeesCollected: number;
    totalOrders: number;
    averageOrderValue: number;
    activeStudents: number;
  };
  statusBreakdown: Record<string, number>;
  topSellingItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
