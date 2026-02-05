import fs from "node:fs";
import path from "node:path";
import { jsonSchemaToZod } from "./json-schema-zod/index.js";
import { resolveRefs } from "json-refs";
import { format } from "prettier";

export const getAllSchemaFiles = (dirPath, files = []) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      getAllSchemaFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
};

const buildLocalLookup = (schemas) => {
  return schemas.reduce((acc, file) => {
    const schemaFile = fs.readFileSync(file, { encoding: "utf8" });
    const schema = JSON.parse(schemaFile);
    if (schema["$id"]) {
      acc[schema["$id"]] = schema;
    }
    return acc;
  }, {});
};

/* This gets called before the ref resolver. It's job is to keep a local cache of the ids
   so that we can avoid needing to fetch the schema from the network, helpful for things like
   local development or if the schema isn't hosted yet */
const localPreResolver = (lookup, obj, path) => {
  if (obj && obj["$ref"] && typeof obj["$ref"] === "string") {
    const ref = obj["$ref"];
    if (ref.startsWith("http")) {
      const parts = ref.split("#");
      const uri = parts[0];
      const fragment = parts[1];

      if (lookup[uri]) {
        const def = { ...lookup[uri] };
        if (fragment) {
          def.$ref = "#" + fragment;
        }
        return def;
      }
    }
  }
  return obj;
};

export const generate = async (dir, outputDir) => {
  let indexExport = "";

  const schemas = getAllSchemaFiles(`${dir}`);
  const localResolverLookup = buildLocalLookup(schemas);

  /* I wan't all definitions as types for narrowing. So this just merges them together*/
  const all = schemas.reduce(
    (acc, file) => {
      const schemaFile = fs.readFileSync(file, { encoding: "utf8" });
      const schema = JSON.parse(schemaFile);
      const fileName = path.basename(file, ".json");

      /* Hoist all schema definitions because we want all definitions available for type narrowing */
      if (schema["$defs"]) {
        Object.entries(schema["$defs"]).forEach(([def, schema]) => {
          if (!acc["$defs"][def] && !schema["$ref"]) {
            acc["$defs"][def] = schema;
          }
        });
        delete schema["$defs"];
      }

      /* Only hoist the root schema to defs if it isn't referencing another def schema already */
      if (!schema["$ref"] && !acc["$defs"][fileName]) {
        acc["$defs"][fileName] = schema;
      }
      return acc;
    },
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $defs: {},
    },
  );

  const res = await resolveRefs(all, {
    refPreProcessor: (obj, path) =>
      localPreResolver(localResolverLookup, obj, path),
  });

  /* Build a per-definition ref map from res.refs so that referenced
     definitions can be imported by name instead of inlined */
  const defRefMaps = {};
  const knownDefs = new Set(Object.keys(res.resolved.$defs));
  for (const [pointer, refInfo] of Object.entries(res.refs)) {
    if (refInfo.circular) continue;
    const match = pointer.match(/^#\/\$defs\/([^/]+)\/(.*)/);
    if (!match) continue;
    const defName = match[1];
    const relativePath = match[2];
    const uri = refInfo.uri || "";
    const targetMatch = uri.match(/\$defs\/([^/]+)$/);
    if (!targetMatch) continue;
    const targetName = targetMatch[1];
    if (targetName === defName) continue;
    if (!knownDefs.has(targetName)) continue;
    if (!defRefMaps[defName]) defRefMaps[defName] = {};
    defRefMaps[defName][relativePath] = targetName.replace(/[^a-zA-Z0-9_$]/g, "");
  }

  fs.mkdirSync(outputDir, { recursive: true });
  for (const [type, schema] of Object.entries(res.resolved.$defs)) {
    const parts = type.split("/");
    const name = (parts[parts.length - 1] ?? "").replace(/[^a-zA-Z0-9_$]/g, "");

    const zodSchema = jsonSchemaToZod(schema, {
      name: name,
      module: "esm",
      type: true,
      withJsdocs: true,
      refMap: defRefMaps[type] || {},
    });

    const formatted = await format(zodSchema, { parser: "typescript" });

    fs.writeFileSync(`${outputDir}/${name}.ts`, formatted);
    indexExport += `export * from './${name}.js';\n`;
  }
  fs.writeFileSync(`${outputDir}/index.ts`, indexExport);
};
