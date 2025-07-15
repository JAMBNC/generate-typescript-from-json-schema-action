import { z } from "zod/v4";

export const ShippingInfo = z.object({
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),
  isBlindShipping: z.boolean(),
  method: z.string().optional(),
  provider: z.enum(["FedEx", "UPS", "USPS", "Other"]),
  weightInPounds: z.number().gte(0).optional(),
});
export type ShippingInfo = z.infer<typeof ShippingInfo>;
