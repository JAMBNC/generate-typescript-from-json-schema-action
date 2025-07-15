import { z } from "zod/v4";

export const Shipment = z.object({
  carrier: z.string().optional(),
  comments: z.string().optional(),
  currencyCode: z.string().optional(),
  estimatedDeliveryDate: z.string().datetime({ offset: true }).optional(),
  identifiers: z.record(z.string(), z.any()).optional(),
  lineItems: z
    .array(
      z.object({
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
      }),
    )
    .optional(),
  orderIdentifiers: z.record(z.string(), z.any()).optional(),
  orderNumber: z
    .string()
    .min(1)
    .max(50)
    .describe(
      "Globally unique orderNumber.  Usually a combination of sales channel and order number",
    ),
  shipmentDate: z.string().datetime({ offset: true }),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
});
export type Shipment = z.infer<typeof Shipment>;
