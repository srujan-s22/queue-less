import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    pickupSlotId: z.string().min(1, 'Pickup slot identifier is required'),
    items: z
      .array(
        z.object({
          menuItemId: z.string().min(1, 'Menu item ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20),
          selectedAddons: z
            .array(
              z.object({
                name: z.string(),
                price: z.number().min(0),
              })
            )
            .optional()
            .default([]),
        })
      )
      .min(1, 'Order must contain at least one item'),
    paymentMethod: z.enum(['counter_cash', 'campus_wallet', 'upi']).default('counter_cash'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum([
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'CANCELLED',
      'REJECTED',
    ]),
    rejectionReason: z.string().optional(),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      reason: z.string().optional(),
    })
    .optional(),
});
