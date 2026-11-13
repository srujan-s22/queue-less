import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { CreateOrderRequest, UpdateOrderStatusRequest } from '../types';
import { adaptOrder } from '../adapters';
import { Order, OrderStatus } from '@/types';

export const ordersApi = {
  createOrder: async (
    dto: CreateOrderRequest,
    idempotencyKey?: string
  ): Promise<Order> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const res = await apiClient<any>(ENDPOINTS.ORDERS.BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto),
    });
    return adaptOrder(res.data);
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await apiClient<any[]>(ENDPOINTS.ORDERS.MY_ORDERS);
    return Array.isArray(res.data) ? res.data.map(adaptOrder) : [];
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await apiClient<any>(ENDPOINTS.ORDERS.DETAIL(id));
    return adaptOrder(res.data);
  },

  updateStatus: async (
    id: string,
    status: OrderStatus,
    rejectionReason?: string
  ): Promise<Order> => {
    const res = await apiClient<any>(ENDPOINTS.ORDERS.STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        rejectionReason,
      } as UpdateOrderStatusRequest),
    });
    return adaptOrder(res.data);
  },

  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const res = await apiClient<any>(ENDPOINTS.ORDERS.CANCEL(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return adaptOrder(res.data);
  },
};
