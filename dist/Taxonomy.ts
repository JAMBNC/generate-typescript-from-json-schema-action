import { z } from "zod/v4";

export const Taxonomy = z.object({
  additionalProperties: z.record(z.string(), z.any()).optional(),
  master: z.string().optional(),
  primary: z.string().optional(),
  sub: z.string().optional(),
});
export type Taxonomy = z.infer<typeof Taxonomy>;
