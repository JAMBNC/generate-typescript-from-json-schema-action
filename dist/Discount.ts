import { z } from "zod/v4";

export const Discount = z.object({
  amount: z.number().gte(0).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  identifiers: z.record(z.string(), z.any()).optional(),
});
export type Discount = z.infer<typeof Discount>;
