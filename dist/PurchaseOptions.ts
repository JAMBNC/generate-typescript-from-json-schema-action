import { z } from "zod/v4";

export const PurchaseOptions = z.object({
  allowsSample: z.boolean(),
  customizable: z.boolean(),
  customizeLeadTimeDayRange: z
    .object({ max: z.number().int().gte(0), min: z.number().int().gte(0) })
    .optional(),
  inStock: z.boolean(),
  leadTime: z.string().optional(),
  minCustomizationQty: z.number().int().gt(0).optional(),
  minSaleQty: z.number().int().gt(0).optional(),
  onSale: z.boolean().optional(),
  plainLeadTimeDayRange: z.string().optional(),
  quantityStepIncrements: z
    .array(
      z.object({
        requiredStepIncrement: z.number().int(),
        startingAtQty: z.number().int(),
      }),
    )
    .optional(),
  stockQty: z.number().int().gte(0),
  suggestedQuantityDisplays: z.array(z.number().int()).optional(),
  tierPrices: z.array(
    z.object({
      discountReason: z.string().optional(),
      price: z.number(),
      salePrice: z.number().optional(),
      startingAtQty: z.number().int(),
    }),
  ),
  toBeDiscontinued: z.boolean(),
});
export type PurchaseOptions = z.infer<typeof PurchaseOptions>;
