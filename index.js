import core from "@actions/core";
import fs from "node:fs";
import path from "node:path";
import exec from "@actions/exec"
import { jsonSchemaToZod } from "json-schema-to-zod";
import { resolveRefs } from "json-refs";
import { format } from "prettier";

function getAllFiles(dirPath, files = []) {
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

const generate = async (dir) => {
  let indexExport = '';
  console.log(`dir: ${dir}`)
  const files = getAllFiles(dir)
  console.log(`files: ${files}`)

  for (const file of files) {
    const parts = file.split('/');
    const name = parts[parts.length - 1].split('.')[0];
    console.log(`file: ${file}`)
    const jsonSchema = JSON.parse(fs.readFileSync(`${file}`, { encoding: 'utf8' }))
    const { resolved } = await resolveRefs(jsonSchema, {
      resolveCirculars: true
    });
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

try {
  const token = core.getInput('token', { required: true });
  const targetRepo = core.getInput('target_repo', { required: true });
  const targetBranch = core.getInput('target_branch') || 'main';
  const schemaDir = core.getInput('schema_dir');
  const typesDir = 'types'


  const repoUrl = `https://x-access-token:${token}@github.com/${targetRepo}.git`;
  await exec.exec('git', ['config', '--global', 'user.email', '"devops@jamplus.com"']);
  await exec.exec('git', ['config', '--global', 'user.name', '"JAM Types Builder"']);
  await exec.exec('git', ['clone', repoUrl, typesDir]);
  process.chdir(typesDir);
  await exec.exec('npm', ['ci']);

  /* Generate the schemas */

  fs.mkdirSync('schemas', { recursive: true })
  process.chdir('./schemas');
  await generate(`../../${schemaDir}`);
  process.chdir('../');

  await exec.exec('tsc', [], { ignoreReturnCode: true });
  await exec.exec('rm', ['-rf', 'schemas'])


  await exec.exec('git', ['add', '.']);
  await exec.exec('git', ['commit', '--allow-empty', '-m', 'Schema type update']);
  await exec.exec('git', ['push', '-f', 'origin', `HEAD:${targetBranch}`]);

} catch (error) {
  core.setFailed(error.message);
}
