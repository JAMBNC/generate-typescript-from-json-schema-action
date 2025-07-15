import { z } from "zod/v4";

export const Order = z.object({
  billingAddress: z.object({
    city: z.string(),
    company: z.string().optional(),
    country: z.string().optional(),
    firstName: z.string().optional(),
    identifiers: z.record(z.string(), z.any()).optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    postal: z.string().optional(),
    region: z.string().optional(),
    streets: z.array(z.string()),
  }),
  comments: z.string().optional(),
  currencyCode: z.string().optional(),
  customerIdentifiers: z.record(z.string(), z.any()).optional(),
  discounts: z
    .array(
      z.object({
        amount: z.number().gte(0).optional(),
        code: z.string().optional(),
        description: z.string().optional(),
        identifiers: z.record(z.string(), z.any()).optional(),
      }),
    )
    .optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  identifiers: z.record(z.string(), z.any()).optional(),
  lastName: z.string().optional(),
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
    .min(1),
  orderDate: z.string().datetime({ offset: true }).optional(),
  orderNumber: z
    .string()
    .min(1)
    .max(50)
    .describe(
      "Globally unique orderNumber.  Usually a combination of sales channel and order number",
    ),
  payments: z
    .array(
      z.object({
        amount: z.number().gte(0).optional(),
        billToName: z.string().optional(),
        identifiers: z.record(z.string(), z.any()).optional(),
        method: z.enum(["CASH", "PO", "CREDIT_CARD", "ON_ACCOUNT"]),
        paymentDate: z.string().datetime({ offset: true }).optional(),
        poNumber: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .optional(),
  salesChannel: z.string(),
  shippingAddress: z
    .object({
      city: z.string(),
      company: z.string().optional(),
      country: z.string().optional(),
      firstName: z.string().optional(),
      identifiers: z.record(z.string(), z.any()).optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      postal: z.string().optional(),
      region: z.string().optional(),
      streets: z.array(z.string()),
    })
    .optional(),
  shippingAmount: z.number().gte(0),
  shippingInfo: z
    .object({
      accountNumber: z.string().optional(),
      accountType: z.string().optional(),
      isBlindShipping: z.boolean(),
      method: z.string().optional(),
      provider: z.enum(["FedEx", "UPS", "USPS", "Other"]),
      weightInPounds: z.number().gte(0).optional(),
    })
    .optional(),
  status: z.literal("CREATED").optional(),
  subtotal: z.number().gte(0),
  taxAmount: z.number().gte(0),
  total: z.number().gte(0),
});
export type Order = z.infer<typeof Order>;
