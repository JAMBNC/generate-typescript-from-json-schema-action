import { parseSchema } from "./parseSchema.js";
export const parseOneOf = (schema, refs) => {
  return schema.oneOf.length
    ? schema.oneOf.length === 1
      ? parseSchema(schema.oneOf[0], {
          ...refs,
          path: [...refs.path, "oneOf", 0],
        })
      : `z.union([${schema.oneOf.map((schema, i) =>
          parseSchema(schema, {
            ...refs,
            path: [...refs.path, "oneOf", i],
          }),
        )}])`
    : "z.any()";
};
