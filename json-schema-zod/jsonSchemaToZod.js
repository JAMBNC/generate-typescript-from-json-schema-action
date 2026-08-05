import { parseSchema } from "./parsers/parseSchema.js";
import { expandJsdocs } from "./utils/jsdocs.js";
export const jsonSchemaToZod = (schema, { module, name, type, noImport, explicitTyping, ...rest } = {}) => {
    if (type && (!name || module !== "esm")) {
        throw new Error("Option `type` requires `name` to be set and `module` to be `esm`");
    }
    if (explicitTyping && (!name || module !== "esm")) {
        throw new Error("Option `explicitTyping` requires `name` to be set and `module` to be `esm`");
    }
    const referencedTypes = new Set();
    let result = parseSchema(schema, {
        module,
        name,
        path: [],
        seen: new Map(),
        referencedTypes,
        ...rest,
    });
    const jsdocs = rest.withJsdocs && typeof schema !== "boolean" && schema.description
        ? expandJsdocs(schema.description)
        : "";
    if (module === "cjs") {
        result = `${jsdocs}module.exports = ${name ? `{ ${JSON.stringify(name)}: ${result} }` : result}
`;
        if (!noImport) {
            result = `${jsdocs}const { z } = require("zod")

${result}`;
        }
    }
    else if (module === "esm") {
        result = explicitTyping
            ? `const _${name} = ${result}
type _${name}Schema = typeof _${name}
export interface ${name}Schema extends _${name}Schema {}
${jsdocs}export const ${name}: ${name}Schema = _${name}
`
            : `${jsdocs}export ${name ? `const ${name} =` : `default`} ${result}
`;
        if (!noImport) {
            let refImports = "";
            for (const refType of [...referencedTypes].sort()) {
                refImports += `import { ${refType} } from './${refType}.js'\n`;
            }
            result = `import { z } from "zod"\n${refImports}
${result}`;
        }
    }
    else if (name) {
        result = `${jsdocs}const ${name} = ${result}`;
    }
    if (type && name) {
        let typeName = typeof type === "string"
            ? type
            : `${name[0].toUpperCase()}${name.substring(1)}`;
        result += `export type ${typeName} = z.infer<typeof ${name}>
`;
    }
    return result;
};
