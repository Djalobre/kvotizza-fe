// lib/validation.ts
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain letters')
  .regex(/\d/, 'Password must contain a number')

export const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: passwordSchema,
})
