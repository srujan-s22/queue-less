import { Order, OrderStatus, OrderItem, PickupSlot, User } from '@/types';
import { INITIAL_ORDERS } from '@/data/mockData';
import { storage } from './storage';
import { configService } from './configService';
import { ordersApi } from '@/lib/api/services/ordersApi';
import { staffApi } from '@/lib/api/services/staffApi';

const ORDERS_STORAGE_KEY = 'orders_list';

export const orderService = {
  getAll(): Order[] {
    return storage.get<Order[]>(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
  },

  getById(id: string): Order | undefined {
    const orders = this.getAll();
    return orders.find(
      (o) => o.id.toLowerCase() === id.toLowerCase() || (o as any)._id === id
    );
  },

  getByStudentId(studentId: string): Order[] {
    const orders = this.getAll();
    return orders.filter((o) => o.studentId === studentId);
  },

  getActiveOrder(studentId: string): Order | undefined {
    const orders = this.getByStudentId(studentId);
    return orders.find((o) =>
      ['READY_FOR_PICKUP', 'PREPARING', 'ACCEPTED', 'PLACED'].includes(o.status)
    );
  },

  async fetchMyOrders(): Promise<Order[]> {
    try {
      const orders = await ordersApi.getMyOrders();
      if (orders && Array.isArray(orders)) {
        storage.set(ORDERS_STORAGE_KEY, orders);
        return orders;
      }
      return this.getAll();
    } catch (err) {
      console.warn('[orderService] Failed to fetch orders from API, using cached:', err);
      return this.getAll();
    }
  },

  async fetchOrderById(id: string): Promise<Order | undefined> {
    try {
      const order = await ordersApi.getOrderById(id);
      if (order) {
        this.saveOrder(order);
        return order;
      }
      return this.getById(id);
    } catch {
      return this.getById(id);
    }
  },

  async fetchKitchenOrders(): Promise<{
    incoming: Order[];
    preparation: Order[];
    ready: Order[];
  }> {
    try {
      const [incoming, preparation, ready] = await Promise.all([
        staffApi.getIncoming(),
        staffApi.getPreparation(),
        staffApi.getReady(),
      ]);

      const allFetched = [...incoming, ...preparation, ...ready];
      const existing = this.getAll();
      const mergedMap = new Map<string, Order>();

      existing.forEach((o) => mergedMap.set(o.id, o));
      allFetched.forEach((o) => mergedMap.set(o.id, o));

      const merged = Array.from(mergedMap.values());
      storage.set(ORDERS_STORAGE_KEY, merged);

      return { incoming, preparation, ready };
    } catch (err) {
      console.warn('[orderService] Failed to fetch kitchen orders from API:', err);
      const all = this.getAll();
      return {
        incoming: all.filter((o) => o.status === 'PLACED'),
        preparation: all.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'),
        ready: all.filter((o) => o.status === 'READY_FOR_PICKUP'),
      };
    }
  },

  async createOrder(params: {
    student: User;
    items: OrderItem[];
    pickupSlot: PickupSlot;
    paymentMethod: 'campus_wallet' | 'upi' | 'netbanking';
  }): Promise<Order> {
    const idempotencyKey = `idem-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      // Submit order to authoritative backend
      const backendOrder = await ordersApi.createOrder(
        {
          pickupSlotId: params.pickupSlot.id,
          paymentMethod: 'counter_cash', // Standard counter collection
          items: params.items.map((i) => ({
            menuItemId: i.menuItem.id,
            quantity: i.quantity,
            selectedAddons: [],
          })),
        },
        idempotencyKey
      );

      // Save to client cache
      const orders = this.getAll();
      orders.unshift(backendOrder);
      storage.set(ORDERS_STORAGE_KEY, orders);

      // Decrement slot locally for immediate UI reactivity
      configService.bookSlot(params.pickupSlot.id);

      return backendOrder;
    } catch (err) {
      console.warn('[orderService] Backend createOrder failed, falling back to local simulation:', err);

      const orders = this.getAll();
      const config = configService.getConfig();

      const nextNum = 1052 + (orders.length - INITIAL_ORDERS.length);
      const orderId = `QL-${nextNum}`;
      const counterLetter = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
      const tokenNumber = `${counterLetter}-${String(Math.floor(Math.random() * 89) + 10)}`;

      const subtotal = params.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      const tax = Math.round((subtotal * config.taxRatePercent) / 100);
      const packagingFee = config.packagingCharge;
      const total = subtotal + tax + packagingFee;

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
        paymentStatus: 'pending',
      };

      orders.unshift(newOrder);
      storage.set(ORDERS_STORAGE_KEY, orders);
      configService.bookSlot(params.pickupSlot.id);

      return newOrder;
    }
  },

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    rejectionReason?: string
  ): Promise<Order | null> {
    const orders = this.getAll();
    const index = orders.findIndex(
      (o) => o.id.toLowerCase() === orderId.toLowerCase() || (o as any)._id === orderId
    );

    // Optimistic local update
    if (index !== -1) {
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
        const gracePeriodMs = config.lateFeeConfig.gracePeriodMinutes * 60 * 1000;
        updated.pickupDeadline = new Date(now.getTime() + gracePeriodMs).toISOString();
      } else if (newStatus === 'PICKED_UP') {
        updated.collectedAt = now.toISOString();
      }

      orders[index] = updated;
      storage.set(ORDERS_STORAGE_KEY, orders);
    }

    try {
      // Call backend API
      const backendOrder = await ordersApi.updateStatus(orderId, newStatus, rejectionReason);
      if (backendOrder) {
        this.saveOrder(backendOrder);
        return backendOrder;
      }
    } catch (err) {
      console.warn('[orderService] Failed to update order status via API:', err);
    }

    return index !== -1 ? orders[index] : null;
  },

  async handoverOrder(orderId: string): Promise<Order | null> {
    try {
      const backendOrder = await staffApi.handoverOrder(orderId);
      if (backendOrder) {
        this.saveOrder(backendOrder);
        return backendOrder;
      }
    } catch (err) {
      console.warn('[orderService] Handover API failed, updating locally:', err);
    }
    return this.updateStatus(orderId, 'PICKED_UP');
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order | null> {
    try {
      const cancelled = await ordersApi.cancelOrder(orderId, reason);
      if (cancelled) {
        this.saveOrder(cancelled);
        return cancelled;
      }
    } catch (err) {
      console.warn('[orderService] Cancel order API failed:', err);
    }
    return this.updateStatus(orderId, 'CANCELLED', reason);
  },

  saveOrder(updated: Order): Order {
    const orders = this.getAll();
    const index = orders.findIndex((o) => o.id === updated.id);
    if (index !== -1) {
      orders[index] = updated;
    } else {
      orders.unshift(updated);
    }
    storage.set(ORDERS_STORAGE_KEY, orders);
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
