import { z } from "zod/v4";

export const MapStringObject = z.record(z.string(), z.any());
export type MapStringObject = z.infer<typeof MapStringObject>;
