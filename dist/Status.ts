import { z } from "zod/v4";

export const Status = z.literal("CREATED");
export type Status = z.infer<typeof Status>;
