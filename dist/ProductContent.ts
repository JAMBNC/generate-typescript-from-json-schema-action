import { z } from "zod/v4";

export const ProductContent = z.object({
  longDescription: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  shortDescription: z.string().optional(),
  shortName: z.string().optional(),
});
export type ProductContent = z.infer<typeof ProductContent>;
