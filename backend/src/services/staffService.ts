import { Order } from '../models';
import { updateOrderStatus } from './orderService';
import { getISTMidnightUTC } from '../utils/timezone';

export const getStaffDashboardMetrics = async () => {
  const todayMidnight = getISTMidnightUTC();

  const [incomingCount, cookingCount, readyCount, completedTodayCount] = await Promise.all([
    Order.countDocuments({ status: 'PLACED' }),
    Order.countDocuments({ status: { $in: ['ACCEPTED', 'PREPARING'] } }),
    Order.countDocuments({ status: 'READY_FOR_PICKUP' }),
    Order.countDocuments({ status: 'PICKED_UP', updatedAt: { $gte: todayMidnight } }),
  ]);

  return {
    incoming: incomingCount,
    cooking: cookingCount,
    ready: readyCount,
    completedToday: completedTodayCount,
  };
};

export const getIncomingOrders = async () => {
  const orders = await Order.find({ status: 'PLACED' })
    .sort({ createdAt: 1 })
    .populate('items.menuItemId', 'imageUrl category');
  return orders;
};

export const getPreparationOrders = async () => {
  const orders = await Order.find({ status: { $in: ['ACCEPTED', 'PREPARING'] } })
    .sort({ createdAt: 1 })
    .populate('items.menuItemId', 'imageUrl category');
  return orders;
};

export const getReadyOrders = async () => {
  const orders = await Order.find({ status: 'READY_FOR_PICKUP' })
    .sort({ readyAt: 1 })
    .populate('items.menuItemId', 'imageUrl category');
  return orders;
};

export const handoverOrder = async (orderId: string, staffId: string) => {
  return updateOrderStatus(orderId, 'PICKED_UP', { id: staffId, role: 'staff' });
};
