import { Order, OrderStatus, OrderItem, PickupSlot, User } from '@/types';
import { INITIAL_ORDERS } from '@/data/mockData';
import { storage } from './storage';
import { configService } from './configService';

const ORDERS_STORAGE_KEY = 'orders_list';

export const orderService = {
  getAll(): Order[] {
    return storage.get<Order[]>(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
  },

  getById(id: string): Order | undefined {
    const orders = this.getAll();
    return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  },

  getByStudentId(studentId: string): Order[] {
    const orders = this.getAll();
    return orders.filter((o) => o.studentId === studentId);
  },

  getActiveOrder(studentId: string): Order | undefined {
    const orders = this.getByStudentId(studentId);
    // Active statuses are PLACED, ACCEPTED, PREPARING, READY_FOR_PICKUP
    return orders.find((o) =>
      ['READY_FOR_PICKUP', 'PREPARING', 'ACCEPTED', 'PLACED'].includes(o.status)
    );
  },

  createOrder(params: {
    student: User;
    items: OrderItem[];
    pickupSlot: PickupSlot;
    paymentMethod: 'campus_wallet' | 'upi' | 'netbanking';
  }): Order {
    const orders = this.getAll();
    const config = configService.getConfig();

    // Generate unique order ID
    const nextNum = 1052 + (orders.length - INITIAL_ORDERS.length);
    const orderId = `QL-${nextNum}`;

    // Generate token code (e.g., C-14)
    const counterLetter = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
    const tokenNumber = `${counterLetter}-${String(Math.floor(Math.random() * 89) + 10)}`;

    const subtotal = params.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
    const tax = Math.round((subtotal * config.taxRatePercent) / 100);
    const packagingFee = config.packagingCharge;
    const total = subtotal + tax + packagingFee;

    // Estimated prep deadline: 15 mins from slot start or now
    const now = new Date();
    const deadline = new Date(now.getTime() + 25 * 60 * 1000).toISOString();

    const newOrder: Order = {
      id: orderId,
      tokenNumber,
      studentId: params.student.id,
      studentName: params.student.name,
      studentRollNo: params.student.rollNumber || '2024CS0000',
      studentPhone: params.student.phone || '+91 98765 00000',
      items: params.items,
      subtotal,
      tax,
      packagingFee,
      lateFeeApplied: 0,
      total,
      status: 'PLACED',
      pickupSlot: params.pickupSlot,
      pickupDeadline: deadline,
      createdAt: now.toISOString(),
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
    };

    orders.unshift(newOrder);
    storage.set(ORDERS_STORAGE_KEY, orders);

    // Increment slot booked count
    configService.bookSlot(params.pickupSlot.id);

    return newOrder;
  },

  updateStatus(orderId: string, newStatus: OrderStatus, rejectionReason?: string): Order | null {
    const orders = this.getAll();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const current = orders[index];
    const now = new Date();
    const config = configService.getConfig();

    const updated: Order = {
      ...current,
      status: newStatus,
      rejectionReason: rejectionReason ?? current.rejectionReason,
    };

    if (newStatus === 'READY_FOR_PICKUP' && !current.readyAt) {
      updated.readyAt = now.toISOString();
      // Set collection deadline based on grace period
      const gracePeriodMs = config.lateFeeConfig.gracePeriodMinutes * 60 * 1000;
      updated.pickupDeadline = new Date(now.getTime() + gracePeriodMs).toISOString();
    } else if (newStatus === 'PICKED_UP') {
      updated.collectedAt = now.toISOString();
    }

    orders[index] = updated;
    storage.set(ORDERS_STORAGE_KEY, orders);
    return updated;
  },

  saveOrder(updated: Order): Order {
    const orders = this.getAll();
    const index = orders.findIndex((o) => o.id === updated.id);
    if (index !== -1) {
      orders[index] = updated;
      storage.set(ORDERS_STORAGE_KEY, orders);
    }
    return updated;
  },

  calculateLateFee(order: Order): { isLate: boolean; lateFee: number; minutesLate: number } {
    const config = configService.getConfig();
    if (!config.lateFeeConfig.isLateFeeEnabled || order.status !== 'READY_FOR_PICKUP') {
      return { isLate: false, lateFee: 0, minutesLate: 0 };
    }

    const now = new Date();
    const deadline = new Date(order.pickupDeadline);
    const diffMs = now.getTime() - deadline.getTime();

    if (diffMs > 0) {
      const minutesLate = Math.ceil(diffMs / (60 * 1000));
      return {
        isLate: true,
        lateFee: config.lateFeeConfig.lateFeeAmount,
        minutesLate,
      };
    }

    return { isLate: false, lateFee: 0, minutesLate: 0 };
  },

  applyLateFee(orderId: string): Order | null {
    const orders = this.getAll();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const current = orders[index];
    const { isLate, lateFee } = this.calculateLateFee(current);

    if (isLate && current.lateFeeApplied === 0) {
      current.lateFeeApplied = lateFee;
      current.total += lateFee;
      orders[index] = current;
      storage.set(ORDERS_STORAGE_KEY, orders);
    }

    return current;
  },

  resetDefaults(): void {
    storage.set(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
  },
};
