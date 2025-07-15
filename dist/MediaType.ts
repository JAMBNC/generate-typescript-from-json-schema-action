import { z } from "zod/v4";

export const MediaType = z.enum(["Image", "Video"]);
export type MediaType = z.infer<typeof MediaType>;
