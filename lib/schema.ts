import { z } from 'zod'

export const REGISTRATION_METHODS = ['email', 'google'] as const

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password must be at most 128 characters'),
  first_name: z.string().max(30, 'First name must be at most 30 characters').optional().default(''),
  last_name: z.string().max(30, 'Last name must be at most 30 characters').optional().default(''),
  registration_method: z.enum(REGISTRATION_METHODS).default('email'),
  profile_pic_url: z.union([z.string().url('Invalid URL'), z.literal('')]).optional().default(''),
  github: z.union([z.string().url('Invalid URL'), z.literal('')]).optional().default(''),
  is_staff: z.boolean().default(false),
  is_superuser: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})