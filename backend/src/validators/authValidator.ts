import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid campus email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    studentId: z.string().min(3, 'Student ID / Roll number is required'),
    department: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
  }),
});

export const walletTopupSchema = z.object({
  body: z.object({
    amount: z.number().int().min(10, 'Minimum top-up is ₹10').max(5000, 'Maximum top-up is ₹5000'),
  }),
});
