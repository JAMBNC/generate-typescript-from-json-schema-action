import { parseSchema } from "./parseSchema.js";
import { half } from "../utils/half.js";
const originalIndex = Symbol("Original index");
const ensureOriginalIndex = (arr) => {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (typeof item === "boolean") {
            newArr.push(item ? { [originalIndex]: i } : { [originalIndex]: i, not: {} });
        }
        else if (originalIndex in item) {
            return arr;
        }
        else {
            newArr.push({ ...item, [originalIndex]: i });
        }
    }
    return newArr;
};
export function parseAllOf(schema, refs) {
    if (schema.allOf.length === 0) {
        return "z.never()";
    }
    else if (schema.allOf.length === 1) {
        const item = schema.allOf[0];
        return parseSchema(item, {
            ...refs,
            path: [...refs.path, "allOf", item[originalIndex]],
        });
    }
    else {
        const [left, right] = half(ensureOriginalIndex(schema.allOf));
        /* `.merge()` rather than `z.intersection()`: a merge of object schemas is itself a
           ZodObject, which keeps the result usable as a `z.discriminatedUnion` member (the
           discriminator stays a top-level key). `z.intersection` produces a ZodIntersection,
           which discriminatedUnion rejects. This assumes allOf composes objects — the only way
           it's used in these schemas (a base ingredient plus a type-specific shape). */
        return `${parseAllOf({ allOf: left }, refs)}.merge(${parseAllOf({
            allOf: right,
        }, refs)})`;
    }
}
