import { withMessage } from "../utils/withMessage.js";
import { parseSchema } from "./parseSchema.js";
export const parseArray = (schema, refs) => {
    if (Array.isArray(schema.items)) {
        return `z.tuple([${schema.items.map((v, i) => parseSchema(v, { ...refs, path: [...refs.path, "items", i] }))}])`;
    }
    let r = !schema.items
        ? "z.array(z.any())"
        : `z.array(${parseSchema(schema.items, {
            ...refs,
            path: [...refs.path, "items"],
        })})`;
    r += withMessage(schema, "minItems", ({ json }) => [
        `.min(${json}`,
        ", ",
        ")",
    ]);
    r += withMessage(schema, "maxItems", ({ json }) => [
        `.max(${json}`,
        ", ",
        ")",
    ]);
    if (schema.uniqueItems === true) {
        const message = JSON.stringify(schema.errorMessage?.uniqueItems ?? "Array items must be unique");
        r += `.refine((items) => new Set(items.map((item) => JSON.stringify(item))).size === items.length, ${message})`;
    }
    return r;
};
