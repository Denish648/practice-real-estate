import { z } from "zod"

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, "only letters")
    .min(1, "required"),
  company: z.string().min(1, "required"),
  phone: z.string().regex(/^[0-9]{10}$/, "must be 10 digits"),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
