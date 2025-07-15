import { z } from "zod/v4";

export const CategoryReference = z.object({
  id: z.number().int(),
  label: z.string(),
  url: z.string(),
});
export type CategoryReference = z.infer<typeof CategoryReference>;
