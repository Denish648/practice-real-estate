import { z } from "zod";

export const createDealsSchema = z.object({
  title: z.string().trim().min(1, "required"),
  city: z
    .string()
    .trim()
    .min(1, "required")
    .regex(/^[A-Za-z\s]+$/, "only letters"),
  price: z.number().min(1, "required"),
  is_private: z.boolean(),
});

export type CreateDealsInput = z.infer<typeof createDealsSchema>;
