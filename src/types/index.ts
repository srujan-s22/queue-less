export type Role = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNumber?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  walletBalance?: number;
}

export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export type Category = 'breakfast' | 'meals' | 'quick-bites' | 'beverages' | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  dietary: DietaryType;
  isAvailable: boolean;
  prepTimeMinutes: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  isSpecial?: boolean;
  calories?: number;
  allergens?: string[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  itemNotes?: string;
  customizations?: string[];
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'CANCELLED'
  | 'REJECTED';

export interface PickupSlot {
  id: string;
  startTime: string; // e.g. "12:30 PM"
  endTime: string;   // e.g. "12:45 PM"
  label: string;     // e.g. "12:30 PM – 12:45 PM"
  capacity: number;
  bookedCount: number;
  status: 'available' | 'filling-fast' | 'full';
}

export interface LateFeeConfig {
  gracePeriodMinutes: number;
  lateFeeAmount: number;
  policyDescription: string;
  isLateFeeEnabled: boolean;
}

export interface CanteenConfig {
  isOpen: boolean;
  operatingHours: {
    open: string;
    close: string;
  };
  announcement?: string;
  slotIntervalMinutes: number;
  maxCapacityPerSlot: number;
  packagingCharge: number;
  taxRatePercent: number;
  lateFeeConfig: LateFeeConfig;
}

export interface Order {
  id: string; // MongoDB document ID (_id)
  orderNumber?: string; // Human-readable order number, e.g. "QL-1042"
  tokenNumber: string; // formatted as "A-12"
  studentId: string;
  studentName: string;
  studentRollNo: string;
  studentPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  packagingFee: number;
  lateFeeApplied: number;
  total: number;
  status: OrderStatus;
  pickupSlot: PickupSlot;
  pickupDeadline: string; // ISO string
  createdAt: string;     // ISO string
  readyAt?: string;      // ISO string
  collectedAt?: string;  // ISO string
  rejectionReason?: string;
  paymentMethod: 'campus_wallet' | 'upi' | 'netbanking';
  paymentStatus: 'paid' | 'pending';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
