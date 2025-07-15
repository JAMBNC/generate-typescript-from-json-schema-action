import { z } from "zod/v4";

export const ProductCustomization = z.object({
  designRequired: z.boolean().optional(),
  prebuiltConfigurationId: z.string().optional(),
  prebuiltCustomizable: z.boolean().optional(),
  prebuiltDesign: z.boolean().optional(),
});
export type ProductCustomization = z.infer<typeof ProductCustomization>;
