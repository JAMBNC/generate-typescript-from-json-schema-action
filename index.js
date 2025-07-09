import core from "@actions/core";
import gh from "@actions/github"
import fs from "node:fs";
import exec from "@actions/exec"
import { compileFromFile } from "json-schema-to-typescript";

const generate = (dir) => {
  const files = fs.readdirSync(dir)

  files.map(file => {
    const name = file.split('.')[0];
    compileFromFile(`${dir}/${file}`).then(ts => {
      fs.writeFileSync(`${name}.d.ts`, ts)
    })
  })
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
  generate(`../${schemaDir}`)

  await exec.exec('git', ['add', '.']);
  await exec.exec('git', ['commit', '-m', 'Schema type update']);
  await exec.exec('git', ['push', '-f', 'origin', `HEAD:${targetBranch}`]);

} catch (error) {
  core.setFailed(error.message);
}
