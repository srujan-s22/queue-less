import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    isOpen: z.boolean().optional(),
    operatingHours: z
      .object({
        openTime: z.string(),
        closeTime: z.string(),
      })
      .optional(),
    announcement: z.string().optional(),
    slotIntervalMinutes: z.number().int().min(5).max(60).optional(),
    defaultSlotCapacity: z.number().int().min(1).max(200).optional(),
    packagingCharge: z.number().min(0).max(100).optional(),
    taxRatePercent: z.number().min(0).max(50).optional(),
    gracePeriodMinutes: z.number().int().min(1).max(60).optional(),
    lateFeeAmount: z.number().min(0).max(500).optional(),
    isLateFeeEnabled: z.boolean().optional(),
  }),
});
