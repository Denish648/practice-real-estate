import { z } from "zod"

export const loginSchema = z.object({
  email: z.email().trim().min(1, "required"),
  password: z.string().trim().min(1, "required"),
})

export const signupSchema = z.object({
  name: z
    .string()
    .regex(/^[A-Za-z\s]+$/, "only letters")
    .trim()
    .min(1, "required"),
  email: z.email().min(1, "required"),
  password: z
    .string()
    .min(6, "Minimum 6 characters")
    .regex(/[A-Za-z]/, "atleast one letter")
    .regex(/[0-9]/, "atleast one number")
    .regex(/[^A-Za-z0-9]/, "atleast one special character"),
  company: z.string().min(1, "required"),
  phone: z.string().regex(/^[0-9]{10}$/, "must be 10 digits"),
  role: z.enum(["broker", "buyer"]),
})

export const changePasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Minimum 6 characters")
    .regex(/[A-Za-z]/, "atleast one letter")
    .regex(/[0-9]/, "atleast one number")
    .regex(/[^A-Za-z0-9]/, "atleast one special character"),
})

export const forgotPasswordSchema = z.object({
  email: z.email().trim().min(1, "required"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
