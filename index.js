import core from "@actions/core";
import fs from "node:fs";
import exec from "@actions/exec"
import { generate } from './lib.js'

try {
  const token = core.getInput('token', { required: true });
  const targetRepo = core.getInput('target_repo', { required: true });
  const targetBranch = core.getInput('target_branch') || 'main';
  const schemaDir = core.getInput('schema_dir');
  const typesDir = 'types'

  const repoUrl = `https://x-access-token:${token}@github.com/${targetRepo}.git`;
  await exec.exec('git', ['config', '--global', 'user.email', '"devops@jamplus.com"']);
  await exec.exec('git', ['config', '--global', 'user.name', '"JAM Types Builder"']);
  await exec.exec('git', ['clone', '--recursive', repoUrl, typesDir]);
  process.chdir(typesDir);
  await exec.exec('npm', ['ci']);

  /* Generate the schemas */
  await generate(`../${schemaDir}`, 'schemas');

  await exec.exec('tsc', [], { ignoreReturnCode: true });
  await exec.exec('rm', ['-rf', 'schemas'])


  await exec.exec('git', ['add', '.']);
  await exec.exec('git', ['commit', '--allow-empty', '-m', 'Schema type update']);
  await exec.exec('git', ['push', '-f', 'origin', `HEAD:${targetBranch}`]);

} catch (error) {
  core.setFailed(error.message);
}
