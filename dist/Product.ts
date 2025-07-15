import { z } from "zod/v4";

export const Product = z.object({
  badges: z
    .array(
      z.object({
        id: z.number().int().optional(),
        imageUrl: z.string().optional(),
        label: z.string().optional(),
      }),
    )
    .optional(),
  brand: z.string().optional(),
  browsable: z.boolean(),
  content: z
    .object({
      longDescription: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      metaTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      shortDescription: z.string().optional(),
      shortName: z.string().optional(),
    })
    .optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  customization: z
    .object({
      designRequired: z.boolean().optional(),
      prebuiltConfigurationId: z.string().optional(),
      prebuiltCustomizable: z.boolean().optional(),
      prebuiltDesign: z.boolean().optional(),
    })
    .optional(),
  identifiers: z.record(z.string(), z.any()).optional(),
  media: z
    .array(
      z.object({
        altText: z.string().optional(),
        mediaType: z.enum(["Image", "Video"]),
        tags: z
          .array(
            z.enum([
              "PRIMARY",
              "SMALL",
              "THUMBNAIL",
              "YOUR_LOGO_HERE",
              "OTHER",
            ]),
          )
          .optional(),
        url: z.string(),
      }),
    )
    .optional(),
  name: z.string(),
  primaryCategory: z
    .object({ id: z.number().int(), label: z.string(), url: z.string() })
    .optional(),
  purchaseOptions: z
    .object({
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
    })
    .optional(),
  searchable: z.boolean(),
  sku: z.string(),
  status: z.string().optional(),
  taxonomy: z.object({
    additionalProperties: z.record(z.string(), z.any()).optional(),
    master: z.string().optional(),
    primary: z.string().optional(),
    sub: z.string().optional(),
  }),
  upc: z.string().optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
  url: z.string(),
});
export type Product = z.infer<typeof Product>;
