import { MenuItem, PickupSlot, Order, CanteenConfig, User, OrderItem } from '@/types';

/**
 * Universal entity normalizer ensuring _id is always mapped to id.
 */
export const normalizeId = <T extends Record<string, any>>(doc: T): T & { id: string } => {
  if (!doc) return doc;
  const id = doc.id || (doc._id ? String(doc._id) : '');
  return {
    ...doc,
    id,
  };
};

export const normalizeList = <T extends Record<string, any>>(docs: T[]): (T & { id: string })[] => {
  if (!Array.isArray(docs)) return [];
  return docs.map(normalizeId);
};

/**
 * Normalizes MongoDB MenuItem to Frontend MenuItem
 */
export const adaptMenuItem = (raw: any): MenuItem => {
  if (!raw) return raw;
  const base = normalizeId(raw);
  return {
    id: base.id,
    name: base.name || '',
    description: base.description || '',
    price: Number(base.price) || 0,
    category: base.category,
    dietary: base.dietary || 'veg',
    isAvailable: base.isAvailable !== false,
    prepTimeMinutes: Number(base.prepTimeMinutes) || 8,
    imageUrl: base.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    rating: base.rating ?? 4.8,
    reviewCount: base.reviewCount ?? 0,
    isSpecial: !!base.isSpecial,
    calories: base.calories,
    allergens: base.allergens || [],
  };
};

/**
 * Normalizes MongoDB PickupSlot to Frontend PickupSlot
 */
export const adaptPickupSlot = (raw: any): PickupSlot => {
  if (!raw) return raw;
  const base = normalizeId(raw);
  const capacity = Number(base.maxCapacity ?? base.capacity ?? 30);
  const bookedCount = Number(base.reservedCount ?? base.bookedCount ?? 0);

  let status: 'available' | 'filling-fast' | 'full' = 'available';
  if (bookedCount >= capacity) {
    status = 'full';
  } else if (bookedCount >= capacity * 0.75) {
    status = 'filling-fast';
  }

  return {
    id: base.id,
    startTime: base.startTime || '',
    endTime: base.endTime || '',
    label: base.label || `${base.startTime} – ${base.endTime}`,
    capacity,
    bookedCount,
    status,
  };
};

/**
 * Normalizes MongoDB Order to Frontend Order
 */
export const adaptOrder = (raw: any): Order => {
  if (!raw) return raw;
  const base = normalizeId(raw);

  // Map items to frontend OrderItem format
  const items: OrderItem[] = Array.isArray(base.items)
    ? base.items.map((item: any) => {
        const menuItemDoc = item.menuItemId && typeof item.menuItemId === 'object'
          ? item.menuItemId
          : {
              _id: item.menuItemId,
              name: item.name,
              price: item.unitPrice,
              imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            };

        const menuItem = adaptMenuItem({
          ...menuItemDoc,
          name: item.name || menuItemDoc.name,
          price: item.unitPrice || menuItemDoc.price,
        });

        const customizations = Array.isArray(item.selectedAddons)
          ? item.selectedAddons.map((a: any) => `${a.name} (+₹${a.price})`)
          : [];

        return {
          menuItem,
          quantity: item.quantity,
          customizations,
        };
      })
    : [];

  const pickupSlot: PickupSlot = base.pickupSlot && typeof base.pickupSlot === 'object' && base.pickupSlot.startTime
    ? adaptPickupSlot(base.pickupSlot)
    : {
        id: typeof base.pickupSlot === 'string' ? base.pickupSlot : String(base.pickupSlot?._id || ''),
        startTime: '',
        endTime: '',
        label: base.pickupSlotLabel || 'Counter Pickup',
        capacity: 30,
        bookedCount: 0,
        status: 'available',
      };

  return {
    id: base.orderNumber || base.id,
    tokenNumber: base.tokenNumber || 'A-01',
    studentId: String(base.student?._id || base.student || base.studentId || ''),
    studentName: base.studentName || '',
    studentRollNo: base.studentRollNo || '',
    studentPhone: base.studentPhone || '',
    items,
    subtotal: Number(base.subtotal) || 0,
    tax: Number(base.tax) || 0,
    packagingFee: Number(base.packagingFee) || 0,
    lateFeeApplied: Number(base.lateFeeApplied) || 0,
    total: Number(base.total) || 0,
    status: base.status || 'PLACED',
    pickupSlot,
    pickupDeadline: base.pickupDeadline ? new Date(base.pickupDeadline).toISOString() : new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    createdAt: base.createdAt ? new Date(base.createdAt).toISOString() : new Date().toISOString(),
    readyAt: base.readyAt ? new Date(base.readyAt).toISOString() : undefined,
    collectedAt: base.collectedAt ? new Date(base.collectedAt).toISOString() : undefined,
    rejectionReason: base.rejectionReason,
    paymentMethod: base.paymentMethod || 'campus_wallet',
    paymentStatus: base.paymentStatus === 'collected' ? 'paid' : (base.paymentStatus || 'pending'),
  };
};

/**
 * Normalizes MongoDB CanteenSettings to Frontend CanteenConfig
 */
export const adaptCanteenConfig = (raw: any): CanteenConfig => {
  if (!raw) {
    return {
      isOpen: true,
      operatingHours: { open: '08:00 AM', close: '07:00 PM' },
      announcement: '',
      slotIntervalMinutes: 15,
      maxCapacityPerSlot: 30,
      packagingCharge: 10,
      taxRatePercent: 5,
      lateFeeConfig: {
        gracePeriodMinutes: 10,
        lateFeeAmount: 20,
        policyDescription: 'Collection grace period is 10 minutes after preparation. Warming surcharge of ₹20 applies thereafter.',
        isLateFeeEnabled: true,
      },
    };
  }

  const base = normalizeId(raw);
  return {
    isOpen: base.isOpen !== false,
    operatingHours: {
      open: base.operatingHours?.openTime || base.operatingHours?.open || '08:00 AM',
      close: base.operatingHours?.closeTime || base.operatingHours?.close || '07:00 PM',
    },
    announcement: base.announcement || '',
    slotIntervalMinutes: Number(base.slotIntervalMinutes) || 15,
    maxCapacityPerSlot: Number(base.defaultSlotCapacity || base.maxCapacityPerSlot) || 30,
    packagingCharge: Number(base.packagingCharge) || 10,
    taxRatePercent: Number(base.taxRatePercent) || 5,
    lateFeeConfig: {
      gracePeriodMinutes: Number(base.gracePeriodMinutes) || 10,
      lateFeeAmount: Number(base.lateFeeAmount) || 20,
      policyDescription: 'Collection grace period is 10 minutes after preparation. Warming surcharge of ₹20 applies thereafter.',
      isLateFeeEnabled: base.isLateFeeEnabled !== false,
    },
  };
};

/**
 * Normalizes MongoDB User to Frontend User
 */
export const adaptUser = (raw: any): User => {
  if (!raw) return raw;
  const base = normalizeId(raw);
  return {
    id: base.id,
    name: base.name || '',
    email: base.email || '',
    role: base.role || 'student',
    rollNumber: base.studentId || base.rollNumber || '',
    department: base.department || '',
    phone: base.phone || '',
    avatar: base.avatar || '',
    walletBalance: Number(base.walletBalance) || 0,
  };
};
