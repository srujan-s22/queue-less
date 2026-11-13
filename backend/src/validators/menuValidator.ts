import { z } from 'zod';

export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    category: z.enum(['breakfast', 'meals', 'quick-bites', 'beverages', 'desserts']),
    price: z.number().min(1, 'Price must be greater than zero'),
    dietary: z.enum(['veg', 'non-veg', 'vegan']),
    prepTimeMinutes: z.number().int().min(1).max(120).default(10),
    imageUrl: z.string().url('A valid image URL is required'),
    rating: z.number().min(0).max(5).optional().default(4.5),
    reviewCount: z.number().int().min(0).optional().default(0),
    isAvailable: z.boolean().optional().default(true),
    isSpecial: z.boolean().optional().default(false),
    calories: z.number().int().min(0).optional(),
    allergens: z.array(z.string()).optional().default([]),
    addons: z
      .array(
        z.object({
          name: z.string().min(1),
          price: z.number().min(0),
        })
      )
      .optional()
      .default([]),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().min(5).optional(),
    category: z.enum(['breakfast', 'meals', 'quick-bites', 'beverages', 'desserts']).optional(),
    price: z.number().min(1).optional(),
    dietary: z.enum(['veg', 'non-veg', 'vegan']).optional(),
    prepTimeMinutes: z.number().int().min(1).max(120).optional(),
    imageUrl: z.string().url().optional(),
    isAvailable: z.boolean().optional(),
    isSpecial: z.boolean().optional(),
    calories: z.number().int().min(0).optional(),
    allergens: z.array(z.string()).optional(),
    addons: z
      .array(
        z.object({
          name: z.string().min(1),
          price: z.number().min(0),
        })
      )
      .optional(),
  }),
});

export const toggleAvailabilitySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    isAvailable: z.boolean(),
  }),
});
