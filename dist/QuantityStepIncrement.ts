import { z } from "zod/v4";

export const QuantityStepIncrement = z.object({
  requiredStepIncrement: z.number().int(),
  startingAtQty: z.number().int(),
});
export type QuantityStepIncrement = z.infer<typeof QuantityStepIncrement>;
