import { Order, OrderStatus, OrderItem, PickupSlot, User } from '@/types';
import { storage } from './storage';
import { configService } from './configService';
import { menuService } from './menuService';
import { ordersApi } from '@/lib/api/services/ordersApi';
import { staffApi } from '@/lib/api/services/staffApi';

const ORDERS_STORAGE_KEY = 'orders_list';

export const orderService = {
  getAll(): Order[] {
    return storage.get<Order[]>(ORDERS_STORAGE_KEY, []);
  },

  getById(id: string): Order | undefined {
    const orders = this.getAll();
    return orders.find(
      (o) =>
        o.id.toLowerCase() === id.toLowerCase() ||
        (o.orderNumber && o.orderNumber.toLowerCase() === id.toLowerCase()) ||
        (o as any)._id === id
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

    // Submit order directly to authoritative backend — DO NOT mask or simulate failures!
    const backendPaymentMethod =
      params.paymentMethod === 'campus_wallet'
        ? 'campus_wallet'
        : params.paymentMethod === 'upi'
        ? 'upi'
        : 'counter_cash';

    // 1. Reconcile item IDs with live backend menu to guarantee valid MongoDB ObjectIds are submitted
    let liveMenu = menuService.getAll();
    if (!liveMenu || liveMenu.length === 0 || liveMenu.some((m) => m.id.startsWith('menu_'))) {
      try {
        liveMenu = await menuService.fetchMenuItems();
      } catch (err) {
        console.warn('[orderService] Failed to fetch live menu before checkout:', err);
      }
    }

    const payloadItems = params.items.map((i) => {
      let menuItemId = i.menuItem.id;
      if (menuItemId.startsWith('menu_') || !/^[0-9a-fA-F]{24}$/.test(menuItemId)) {
        const liveMatch = liveMenu.find(
          (m) =>
            m.name.toLowerCase() === i.menuItem.name.toLowerCase() &&
            /^[0-9a-fA-F]{24}$/.test(m.id)
        );
        if (liveMatch) {
          menuItemId = liveMatch.id;
        }
      }
      return {
        menuItemId,
        quantity: i.quantity,
        selectedAddons: [],
      };
    });

    const backendOrder = await ordersApi.createOrder(
      {
        pickupSlotId: params.pickupSlot.id,
        paymentMethod: backendPaymentMethod,
        items: payloadItems,
      },
      idempotencyKey
    );

    // Save to client cache on genuine success
    const orders = this.getAll();
    orders.unshift(backendOrder);
    storage.set(ORDERS_STORAGE_KEY, orders);

    // Decrement slot locally for immediate UI reactivity
    configService.bookSlot(params.pickupSlot.id);

    return backendOrder;
  },

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    rejectionReason?: string
  ): Promise<Order> {
    // Call backend API first — throw on failure without fake local simulation
    const backendOrder = await ordersApi.updateStatus(orderId, newStatus, rejectionReason);
    this.saveOrder(backendOrder);
    return backendOrder;
  },

  async handoverOrder(orderId: string): Promise<Order> {
    const backendOrder = await staffApi.handoverOrder(orderId);
    this.saveOrder(backendOrder);
    return backendOrder;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const cancelled = await ordersApi.cancelOrder(orderId, reason);
    this.saveOrder(cancelled);
    return cancelled;
  },

  saveOrder(updated: Order): Order {
    const orders = this.getAll();
    const index = orders.findIndex(
      (o) =>
        o.id === updated.id ||
        (o.orderNumber && updated.orderNumber && o.orderNumber === updated.orderNumber)
    );
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
    storage.set(ORDERS_STORAGE_KEY, []);
  },
};
