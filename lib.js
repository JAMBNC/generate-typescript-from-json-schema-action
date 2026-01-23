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

export const generate = async (dir, outputDir) => {
  let indexExport = "";

  const allFile = fs.readFileSync(`${dir}/All.json`, { encoding: "utf8" });
  const all = JSON.parse(allFile);

  const manualSchemas = getAllSchemaFiles(`${dir}/manual`);
  manualSchemas.forEach((file) => {
    const schemaFile = fs.readFileSync(file, { encoding: "utf8" });
    const schema = JSON.parse(schemaFile);
    Object.assign(all["$defs"], schema["$defs"]);
  });

  const res = await resolveRefs(all);

  fs.mkdirSync(outputDir, { recursive: true });
  for (const [type, schema] of Object.entries(res.resolved.$defs)) {
    const parts = type.split("/");
    const name = (parts[parts.length - 1] ?? "").replace(/[^a-zA-Z0-9_$]/g, "");

    const zodSchema = jsonSchemaToZod(schema, {
      name: name,
      module: "esm",
      type: true,
    });

    const formatted = await format(zodSchema, { parser: "typescript" });

    fs.writeFileSync(`${outputDir}/${name}.ts`, formatted);
    indexExport += `export * from './${name}';\n`;
  }
  fs.writeFileSync(`${outputDir}/index.ts`, indexExport);
};
