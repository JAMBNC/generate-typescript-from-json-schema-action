import { z } from "zod/v4";

export const LineItem = z.object({
  children: z.array(z.any()).optional(),
  discountAmount: z.number().gte(0).optional(),
  identifiers: z.record(z.string(), z.any()).optional(),
  imageUrls: z.array(z.string()).optional(),
  name: z.string(),
  productIdentifiers: z.record(z.string(), z.any()).optional(),
  quantity: z.number().gt(0),
  sku: z.string(),
  subtotal: z.number().gte(0),
  taxAmount: z.number().gte(0),
  total: z.number().gte(0),
  weightInPounds: z.number().gte(0),
});
export type LineItem = z.infer<typeof LineItem>;
