import { z } from "zod/v4";

export const ProductBadge = z.object({
  id: z.number().int().optional(),
  imageUrl: z.string().optional(),
  label: z.string().optional(),
});
export type ProductBadge = z.infer<typeof ProductBadge>;
