import core from "@actions/core";
import gh from "@actions/github"
import fs from "node:fs";
import exec from "@actions/exec"
import { jsonSchemaToZod } from "json-schema-to-zod";
import { resolveRefs } from "json-refs";
import { format } from "prettier";

const generate = async (dir) => {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const name = file.split('.')[0];
    const jsonSchema = JSON.parse(fs.readFileSync(`${dir}/${file}`, { encoding: 'utf8' }))
    const { resolved } = await resolveRefs(jsonSchema);
    const zodSchema = jsonSchemaToZod(resolved, {
      name: name,
      module: "esm",
      type: true,
    })
    const formatted = await format(zodSchema, { parser: "typescript" });
    fs.writeFileSync(`${name}.ts`, formatted)
  }
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

  /* Generate the schemas */
  await generate(`../${schemaDir}`)

  await exec.exec('git', ['add', '.']);
  await exec.exec('git', ['commit', '-m', 'Schema type update']);
  await exec.exec(`(git push -f origin HEAD:${targetBranch}) || true`);

} catch (error) {
  core.setFailed(error.message);
}
