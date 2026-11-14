import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  Order,
  CanteenSettings,
  AuditLog,
  User,
  Counter,
  ICanteenSettings,
} from '../models';
import { formatToIST } from '../utils/timezone';
import { socketEmitter } from '../socket/emitter';
import { ConflictError, NotFoundError } from '../utils/errors';

export interface AdminOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const getAllOrders = async (query: AdminOrderQuery = {}) => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.search && query.search.trim() !== '') {
    const s = query.search.trim();
    filter.$or = [
      { orderNumber: { $regex: s, $options: 'i' } },
      { tokenNumber: { $regex: s, $options: 'i' } },
      { studentName: { $regex: s, $options: 'i' } },
      { studentRollNo: { $regex: s, $options: 'i' } },
    ];
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.menuItemId', 'imageUrl category'),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCanteenSettings = async () => {
  let settings = await CanteenSettings.findOne({ singletonKey: 'CANTEEN_GLOBAL_SETTINGS' });
  if (!settings) {
    settings = await CanteenSettings.create({
      singletonKey: 'CANTEEN_GLOBAL_SETTINGS',
      isOpen: true,
      operatingHours: { openTime: '08:00 AM', closeTime: '07:00 PM' },
      announcement: '',
      slotIntervalMinutes: 15,
      defaultSlotCapacity: 30,
      packagingCharge: 10,
      taxRatePercent: 5,
      gracePeriodMinutes: 10,
      lateFeeAmount: 20,
      isLateFeeEnabled: true,
    });
  }
  return settings;
};

export const updateCanteenSettings = async (
  updates: Partial<ICanteenSettings>,
  adminId: string
) => {
  const settings = await CanteenSettings.findOneAndUpdate(
    { singletonKey: 'CANTEEN_GLOBAL_SETTINGS' },
    { $set: { ...updates, updatedBy: new Types.ObjectId(adminId) } },
    { new: true, upsert: true }
  );

  // Record audit log
  await AuditLog.create({
    actorId: new Types.ObjectId(adminId),
    actorRole: 'admin',
    action: 'SETTINGS_UPDATE',
    resourceType: 'CanteenSettings',
    resourceId: settings._id.toString(),
    metadata: updates,
    timestamp: new Date(),
  });

  socketEmitter.emitSettingsUpdated(settings);

  return settings;
};

export const getAnalyticsDashboard = async () => {
  // Aggregate revenue and orders
  const revenueAgg = await Order.aggregate([
    { $match: { status: { $in: ['PICKED_UP', 'READY_FOR_PICKUP', 'PREPARING', 'ACCEPTED'] } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        subtotalRevenue: { $sum: '$subtotal' },
        lateFeesCollected: { $sum: '$lateFeeApplied' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const metrics = revenueAgg[0] || {
    totalRevenue: 0,
    subtotalRevenue: 0,
    lateFeesCollected: 0,
    totalOrders: 0,
  };

  const aov = metrics.totalOrders > 0 ? Math.round(metrics.totalRevenue / metrics.totalOrders) : 0;
  const activeStudentsCount = await User.countDocuments({ role: 'student', status: 'active' });

  // Status breakdown
  const statusBreakdownAgg = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statusMap: Record<string, number> = {};
  statusBreakdownAgg.forEach((item) => {
    statusMap[item._id] = item.count;
  });

  // Top selling items
  const topItemsAgg = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.itemTotal' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  return {
    overview: {
      totalRevenue: metrics.totalRevenue,
      subtotalRevenue: metrics.subtotalRevenue,
      lateFeesCollected: metrics.lateFeesCollected,
      totalOrders: metrics.totalOrders,
      averageOrderValue: aov,
      activeStudents: activeStudentsCount,
    },
    statusBreakdown: statusMap,
    topSellingItems: topItemsAgg.map((item) => ({
      name: item._id,
      quantity: item.totalQuantity,
      revenue: item.totalRevenue,
    })),
  };
};

export const exportOrdersCsv = async (): Promise<string> => {
  const orders = await Order.find().sort({ createdAt: -1 });

  const headers = [
    'Order Number',
    'Token',
    'Date (IST)',
    'Student Name',
    'Student Roll No',
    'Items Summary',
    'Subtotal (INR)',
    'Tax (INR)',
    'Packaging (INR)',
    'Late Fee (INR)',
    'Total (INR)',
    'Status',
    'Pickup Slot',
    'Payment Method',
    'Payment Status',
  ];

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = orders.map((o) => {
    const itemsSummary = o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ');
    return [
      escapeCsv(o.orderNumber),
      escapeCsv(o.tokenNumber),
      escapeCsv(formatToIST(o.createdAt)),
      escapeCsv(o.studentName),
      escapeCsv(o.studentRollNo),
      escapeCsv(itemsSummary),
      o.subtotal,
      o.tax,
      o.packagingFee,
      o.lateFeeApplied,
      o.total,
      escapeCsv(o.status),
      escapeCsv(o.pickupSlotLabel),
      escapeCsv(o.paymentMethod),
      escapeCsv(o.paymentStatus),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  department?: string;
  phone?: string;
}

export const getStaffRoster = async () => {
  const [staffUsers, counters] = await Promise.all([
    User.find({ role: 'staff' }).select('-passwordHash').sort({ createdAt: 1 }),
    Counter.find(),
  ]);

  return staffUsers.map((u, idx) => {
    const assignedCounter = counters.find(
      (c) => c.activeOperatorId && c.activeOperatorId.toString() === u._id.toString()
    ) || counters[idx % Math.max(1, counters.length)];

    return {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: 'Kitchen Operator',
      counter: assignedCounter ? `${assignedCounter.name} (${assignedCounter.counterIdentifier})` : 'Express Counter #2',
      shift: u.department || '07:30 AM – 03:30 PM (Morning)',
      status: u.status === 'active' ? 'Active' : 'On Break',
      phone: u.phone || '+91 98111 22334',
      createdAt: u.createdAt,
    };
  });
};

export const createStaffMember = async (input: CreateStaffInput) => {
  const existing = await User.findOne({ email: input.email.toLowerCase().trim() });
  if (existing) {
    throw new ConflictError('A user with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const newStaff = await User.create({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash,
    role: 'staff',
    department: input.department?.trim() || 'Central Canteen Operations',
    phone: input.phone?.trim() || '',
    walletBalance: 0,
    status: 'active',
  });

  return {
    id: newStaff._id.toString(),
    name: newStaff.name,
    email: newStaff.email,
    role: 'Kitchen Operator',
    counter: 'Counter #2 (Express Lunch & Bowls)',
    shift: newStaff.department || '07:30 AM – 03:30 PM (Morning)',
    status: 'Active',
    phone: newStaff.phone,
    createdAt: newStaff.createdAt,
  };
};

export const updateStaffStatus = async (staffId: string, status?: string) => {
  const staff = await User.findOne({ _id: staffId, role: 'staff' });
  if (!staff) {
    throw new NotFoundError('Staff member not found.');
  }

  let newStatus: 'active' | 'suspended';
  if (status) {
    newStatus = status.toLowerCase() === 'active' ? 'active' : 'suspended';
  } else {
    newStatus = staff.status === 'active' ? 'suspended' : 'active';
  }

  staff.status = newStatus;
  await staff.save();

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: 'Kitchen Operator',
    counter: 'Counter #2 (Express Lunch & Bowls)',
    shift: staff.department || '07:30 AM – 03:30 PM (Morning)',
    status: newStatus === 'active' ? 'Active' : 'On Break',
    phone: staff.phone,
    createdAt: staff.createdAt,
  };
};
