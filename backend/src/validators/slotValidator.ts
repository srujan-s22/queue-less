import { z } from 'zod';

export const slotQuerySchema = z.object({
  query: z.object({
    date: z.string().optional(),
  }),
});
