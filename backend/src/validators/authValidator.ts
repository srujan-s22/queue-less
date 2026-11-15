import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().trim().email('Please enter a valid campus email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['student', 'staff', 'admin']).optional(),
      studentId: z.string().trim().optional(),
      department: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      accessKey: z.string().trim().optional(),
    })
    .refine(
      (data) => {
        const role = data.role || 'student';
        if (role === 'student') {
          return !!data.studentId && data.studentId.length >= 3;
        }
        return true;
      },
      {
        message: 'Student ID / Roll number is required for student registration',
        path: ['studentId'],
      }
    )
    .refine(
      (data) => {
        if (data.role === 'staff') {
          return !!data.accessKey && data.accessKey.length > 0;
        }
        return true;
      },
      {
        message: 'Staff access key is required',
        path: ['accessKey'],
      }
    )
    .refine(
      (data) => {
        if (data.role === 'admin') {
          return !!data.accessKey && data.accessKey.length > 0;
        }
        return true;
      },
      {
        message: 'Admin access key is required',
        path: ['accessKey'],
      }
    ),
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
