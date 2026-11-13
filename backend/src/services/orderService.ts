import mongoose, { Types } from 'mongoose';
import {
  Order,
  IOrder,
  OrderStatus,
  MenuItem,
  CanteenSettings,
  User,
  OrderStatusHistory,
} from '../models';
import { atomicReserveSlot, atomicReleaseSlot } from './slotService';
import { addMinutes } from '../utils/timezone';
import { socketEmitter } from '../socket/emitter';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors';

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  selectedAddons?: { name: string; price: number }[];
}

export interface CreateOrderDTO {
  pickupSlotId: string;
  items: CreateOrderItemInput[];
  paymentMethod: 'counter_cash' | 'campus_wallet' | 'upi';
  idempotencyKey?: string;
}

export const createOrder = async (
  userId: string,
  dto: CreateOrderDTO
): Promise<IOrder> => {
  // Check idempotency if key is provided
  if (dto.idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey: dto.idempotencyKey });
    if (existingOrder) {
      return existingOrder;
    }
  }

  // 1. Fetch user details
  const user = await User.findById(userId);
  if (!user || user.status !== 'active') {
    throw new BadRequestError('User account not found or inactive.');
  }

  // 2. Fetch Canteen Settings
  const settings = await CanteenSettings.findOne({ singletonKey: 'CANTEEN_GLOBAL_SETTINGS' });
  if (settings && !settings.isOpen) {
    throw new BadRequestError('Canteen is currently closed for online pre-orders.');
  }
  const packagingFee = settings ? settings.packagingCharge : 10;
  const taxRate = settings ? settings.taxRatePercent : 5;

  // 3. Atomically reserve slot first (concurrency protection)
  const reservedSlot = await atomicReserveSlot(dto.pickupSlotId);

  let walletDeducted = false;
  let totalOrderAmount = 0;

  try {
    // 4. Validate menu items and calculate true server prices
    const itemIds = dto.items.map((i) => i.menuItemId);
    const validObjectIds = itemIds.filter((id) => mongoose.isValidObjectId(id));
    const nonObjectIds = itemIds.filter((id) => !mongoose.isValidObjectId(id));

    const dbMenuItems = validObjectIds.length > 0
      ? await MenuItem.find({ _id: { $in: validObjectIds }, isArchived: false })
      : [];

    const dbItemMap = new Map<string, any>();
    dbMenuItems.forEach((item) => dbItemMap.set(item._id.toString(), item));

    // Support legacy mock IDs (e.g. "menu_01") mapped to seeded items
    if (nonObjectIds.length > 0) {
      const allActive = await MenuItem.find({ isArchived: false }).sort({ createdAt: 1 });
      for (const nonId of nonObjectIds) {
        if (nonId.startsWith('menu_')) {
          const idx = parseInt(nonId.replace('menu_', ''), 10) - 1;
          if (idx >= 0 && idx < allActive.length) {
            dbItemMap.set(nonId, allActive[idx]);
          }
        }
      }
    }

    const orderItemsSnapshot: any[] = [];
    let subtotal = 0;

    for (const itemInput of dto.items) {
      const dbItem = dbItemMap.get(itemInput.menuItemId);
      if (!dbItem) {
        throw new BadRequestError(`Dish '${itemInput.menuItemId}' does not exist.`);
      }
      if (!dbItem.isAvailable) {
        throw new ConflictError(`'${dbItem.name}' is currently sold out (Item 86).`);
      }

      // Calculate add-on sum using server data
      let addonsCost = 0;
      const verifiedAddons: { name: string; price: number }[] = [];

      if (itemInput.selectedAddons && itemInput.selectedAddons.length > 0) {
        for (const addonReq of itemInput.selectedAddons) {
          const matchedAddon = dbItem.addons.find(
            (a: any) => a.name.toLowerCase() === addonReq.name.toLowerCase()
          );
          const addonPrice = matchedAddon ? matchedAddon.price : addonReq.price;
          addonsCost += addonPrice;
          verifiedAddons.push({
            name: matchedAddon ? matchedAddon.name : addonReq.name,
            price: addonPrice,
          });
        }
      }

      const itemTotal = (dbItem.price + addonsCost) * itemInput.quantity;
      subtotal += itemTotal;

      orderItemsSnapshot.push({
        menuItemId: dbItem._id,
        name: dbItem.name,
        unitPrice: dbItem.price,
        quantity: itemInput.quantity,
        selectedAddons: verifiedAddons,
        itemTotal,
      });
    }

    const tax = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + tax + packagingFee;
    totalOrderAmount = total;

    // 5. Handle Payment Method
    let paymentStatus: 'pending' | 'collected' = 'pending';
    if (dto.paymentMethod === 'campus_wallet') {
      if (user.walletBalance < total) {
        throw new BadRequestError(
          `Insufficient wallet balance (₹${user.walletBalance}). Required: ₹${total}.`
        );
      }
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: -total } });
      walletDeducted = true;
      paymentStatus = 'collected';
    }

    // 6. Generate sequential / distinctive order numbers with collision retry
    const totalOrdersCount = await Order.countDocuments();
    const baseSeq = 1000 + ((totalOrdersCount + 1) % 9000);
    const counterLetter = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
    const tokenNumber = `${counterLetter}-${Math.floor(10 + Math.random() * 90)}`;

    let newOrder: IOrder | null = null;
    let attempts = 0;

    while (!newOrder && attempts < 5) {
      attempts++;
      try {
        const entropy = Math.floor(10 + Math.random() * 90);
        const orderNumber = attempts === 1 && totalOrdersCount === 0 ? `QL-${baseSeq}` : `QL-${baseSeq}-${entropy}`;

        newOrder = await Order.create({
          orderNumber,
          tokenNumber,
          student: user._id,
          studentName: user.name,
          studentRollNo: user.studentId || 'N/A',
          studentPhone: user.phone || '',
          items: orderItemsSnapshot,
          subtotal,
          tax,
          packagingFee,
          lateFeeApplied: 0,
          total,
          status: 'PLACED',
          pickupSlot: reservedSlot._id,
          pickupSlotLabel: reservedSlot.label,
          counterId: 'COUNTER-01',
          paymentMethod: dto.paymentMethod,
          paymentStatus,
          idempotencyKey: dto.idempotencyKey,
        });
      } catch (createErr: any) {
        if (createErr.code === 11000 && attempts < 5) {
          continue; // Retry with fresh entropy
        }
        throw createErr;
      }
    }

    if (!newOrder) {
      throw new Error('Could not generate unique order number after multiple attempts.');
    }

    // 8. Log initial status history
    await OrderStatusHistory.create({
      orderId: newOrder._id,
      newStatus: 'PLACED',
      changedBy: user._id,
      actorRole: 'student',
      reason: 'Order placed by student',
      timestamp: new Date(),
    });

    // 9. Real-time Socket.IO notification to staff and student
    socketEmitter.emitOrderCreated(newOrder);

    return newOrder;
  } catch (error) {
    // Rollback atomic slot reservation on failure
    await atomicReleaseSlot(reservedSlot._id);

    // Rollback wallet balance if deducted
    if (walletDeducted) {
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: totalOrderAmount } });
    }

    throw error;
  }
};

export const getStudentOrders = async (userId: string) => {
  const orders = await Order.find({ student: userId }).sort({ createdAt: -1 });
  return orders;
};

export const getOrderById = async (orderId: string, user: { id: string; role: string }) => {
  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query).populate('items.menuItemId', 'imageUrl category');
  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Security check: Students may only view their own orders
  if (user.role === 'student' && order.student.toString() !== user.id) {
    throw new ForbiddenError('You do not have permission to view this order.');
  }

  const history = await OrderStatusHistory.find({ orderId: order._id }).sort({ timestamp: 1 });

  return {
    ...order.toObject(),
    history,
  };
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  actor: { id: string; role: 'student' | 'staff' | 'admin' },
  rejectionReason?: string
) => {
  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  const previousStatus = order.status;

  // Validate status transitions
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY_FOR_PICKUP'],
    READY_FOR_PICKUP: ['PICKED_UP'],
    PICKED_UP: [],
    CANCELLED: [],
    REJECTED: [],
  };

  if (!validTransitions[previousStatus].includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition order status from '${previousStatus}' to '${newStatus}'.`
    );
  }

  const updates: Partial<IOrder> = { status: newStatus };

  if (newStatus === 'READY_FOR_PICKUP') {
    const readyAt = new Date();
    const settings = await CanteenSettings.findOne({ singletonKey: 'CANTEEN_GLOBAL_SETTINGS' });
    const graceMinutes = settings ? settings.gracePeriodMinutes : 10;
    updates.readyAt = readyAt;
    updates.pickupDeadline = addMinutes(readyAt, graceMinutes);
  } else if (newStatus === 'PICKED_UP') {
    updates.collectedAt = new Date();
    updates.paymentStatus = 'collected';
  } else if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
    if (rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }
    // Release pickup slot
    await atomicReleaseSlot(order.pickupSlot);

    // If student paid via wallet, issue immediate refund
    if (order.paymentMethod === 'campus_wallet' && order.paymentStatus === 'collected') {
      await User.findByIdAndUpdate(order.student, { $inc: { walletBalance: order.total } });
      updates.paymentStatus = 'refunded';
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    order._id,
    { $set: updates },
    { new: true }
  );

  // Record history
  await OrderStatusHistory.create({
    orderId: order._id,
    previousStatus,
    newStatus,
    changedBy: new Types.ObjectId(actor.id),
    actorRole: actor.role,
    reason: rejectionReason || `Status changed to ${newStatus}`,
    timestamp: new Date(),
  });

  // Real-time Socket.IO notification to student and staff
  if (updatedOrder) {
    socketEmitter.emitOrderStatusUpdate(updatedOrder, previousStatus);
  }

  return updatedOrder;
};

export const cancelOrderByStudent = async (
  orderId: string,
  userId: string,
  reason?: string
) => {
  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  if (order.student.toString() !== userId) {
    throw new ForbiddenError('You can only cancel your own orders.');
  }

  if (order.status !== 'PLACED') {
    throw new BadRequestError(
      `Order cannot be cancelled because it is already '${order.status}'. Only newly placed orders can be cancelled.`
    );
  }

  return updateOrderStatus(
    order._id.toString(),
    'CANCELLED',
    { id: userId, role: 'student' },
    reason || 'Cancelled by student'
  );
};
