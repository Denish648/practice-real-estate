import { z } from "zod"

export const createDealsSchema = z.object({
  title: z.string().trim().min(1, "required"),
  city: z
    .string()
    .trim()
    .min(1, "required")
    .regex(/^[A-Za-z\s]+$/, "only letters"),
  price: z.coerce.number().min(1, "required"),
  is_private: z.coerce.boolean(),
})

export const updateDealsSchema = createDealsSchema

export type CreateDealsInput = z.infer<typeof createDealsSchema>
export type UpdateDealsInput = z.infer<typeof updateDealsSchema>
