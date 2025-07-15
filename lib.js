import fs from "node:fs";
import path from "node:path";
import exec from "@actions/exec"
import { jsonSchemaToZod } from "./json-schema-to-zod/dist/esm/index.js";
import { resolveRefs } from "json-refs";
import { format } from "prettier";

export const getAllFiles = (dirPath, files = []) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

export const generate = async (dir, outputDir) => {
  let indexExport = '';

  const all = JSON.parse(fs.readFileSync(`${dir}/All.json`))
  const res = await resolveRefs(all)

  const defs = Object.values(res.refs).reduce((defs, ref) => {
    defs[ref.uri] = ref.value
    return defs;
  }, {})

  fs.mkdirSync(outputDir, { recursive: true })
  for (const [type, schema] of Object.entries(defs)) {

    const parts = type.split('/');
    const name = (parts[parts.length - 1] ?? '').replace(/[^a-zA-Z0-9_$]/g, '');

    const zodSchema = jsonSchemaToZod(schema, {
      name: name,
      module: "esm",
      type: true,
    })

    const formatted = await format(zodSchema, { parser: "typescript" });

    fs.writeFileSync(`${outputDir}/${name}.ts`, formatted)
    indexExport += `export * from './${name}';\n`
  }
  fs.writeFileSync(`${outputDir}/index.ts`, indexExport)
}
