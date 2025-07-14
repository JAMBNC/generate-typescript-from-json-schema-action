import fs from "node:fs";
import path from "node:path";
import exec from "@actions/exec"
import { jsonSchemaToZod } from "json-schema-to-zod";
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

export const generate = async (dir) => {
  let indexExport = '';
  console.log(`dir: ${dir}`)
  const files = getAllFiles(dir)
  console.log(`files: ${files}`)

  for (const file of files) {
    const parts = file.split('/');
    const name = parts[parts.length - 1].split('.')[0];
    console.log(`file: ${file}`)
    const jsonSchema = JSON.parse(fs.readFileSync(`${file}`, { encoding: 'utf8' }))
    let resolved = jsonSchema;

    try {
      const result = await resolveRefs(jsonSchema, {
        includeInvalid: true,
        resolveCirculars: false
      });
      resolved = result.resolved
    } catch (e) {
      console.log(`Issue with schema: ${e}`)
    }

    const zodSchema = jsonSchemaToZod(resolved, {
      name: name,
      module: "esm",
      type: true,
    })

    const formatted = await format(zodSchema, { parser: "typescript" });
    fs.writeFileSync(`${name}.ts`, formatted)
    indexExport += `export * from './${name}';\n`
  }
  fs.writeFileSync('index.ts', indexExport)

}
