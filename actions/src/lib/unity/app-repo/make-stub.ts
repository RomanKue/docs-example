import {exec as origExec, execFile as origExecFile} from 'child_process';
import {promisify} from 'util';

import * as core from '@actions/core';
import {Repository} from '../../github/api/repos/response/repository.js';
import * as fs from 'fs';
import path from 'path';
import * as os from 'os';
import {base64} from '../../strings/encoding.js';
import {getGithubToken} from '../../github/octokit.js';

const exec = promisify(origExec);
const execFile = promisify(origExecFile);

type StdStreams = { stdout: string, stderr: string };

export const withErrorLogging = async (cb: () => Promise<StdStreams>): Promise<StdStreams> => {
  try {
    const {stdout, stderr} = await cb();
    core.info(stdout);
    core.warning(stderr);
    return {stdout, stderr};
  } catch (e) {
    if (isStdout(e)) {
      core.info(e.stdout);
    }
    if (isStderr(e)) {
      core.info(e.stderr);
    }
    throw e;
  }
};

const isStderr = (err: unknown): err is { stderr: string } => 'stderr' in (err as Record<string, unknown>);
const isStdout = (err: unknown): err is { stdout: string } => 'stdout' in (err as Record<string, unknown>);

export const makeStub = async (
  name: string,
  type: 'angular' | 'quarkus',
  repository: Readonly<Pick<Repository, 'name' | 'html_url'>>
) => {
  core.info(`starting to make stub: ${name} for ${type}`);
  const scriptsPath = `${process.cwd()}/../make-stubs`;
  core.debug(`available scripts in ${scriptsPath} are ${fs.readdirSync(scriptsPath).join(' ')}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `unity-${repository.name}-${name}-`));
  core.debug(`working in tmp dir: ${tmpDir}`);
  try {
    await withErrorLogging(() => exec(`
    set -xeu pipefail

    mkdir ${tmpDir}/${repository.name}
    git init ${tmpDir}/${repository.name}
    cp $(git rev-parse --show-toplevel)/.git/config ${tmpDir}/${repository.name}/.git/config

    cd ${tmpDir}/${repository.name}
    git config --list
    git remote add origin ${repository.html_url}
    git pull main

    # git -c http.extraHeader="Authorization: Basic ${base64(`:${getGithubToken()}`)}" clone ${repository.html_url}
    # cd ${repository.name}
    # git checkout main
    `, {shell: 'bash'}));

    await withErrorLogging(() => execFile(`${scriptsPath}/${type}.bash`, [name], {
      shell: 'bash',
      cwd: `${tmpDir}/${repository.name}`
    }));

    await withErrorLogging(() => exec(`
    set -xeu pipefail

    git push origin main:main
    `, {shell: 'bash', cwd: `${tmpDir}/${repository.name}`}));

  } finally {
    fs.rmSync(tmpDir, {recursive: true});
  }
};
