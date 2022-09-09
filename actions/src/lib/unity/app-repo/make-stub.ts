import {exec as origExec, execFile as origExecFile} from 'child_process';
import {promisify} from 'util';

import * as core from '@actions/core';
import {Repository} from '../../github/api/repos/response/repository.js';
import {mkdtempSync, rmSync} from 'fs';
import path from 'path';
import * as os from 'os';

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
  repository: Readonly<Pick<Repository, 'name' | 'url'>>
) => {
  core.info(`starting to make stub: ${name} for ${type}`);
  const scriptsPath = `${process.cwd()}/../make-stubs`;
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), `unity-${repository.name}-${name}-`));
  try {
    await withErrorLogging(() => exec(`
    set -xeu pipefail

    git clone ${repository.url}
    cd ${repository.name}
    git checkout main
    `, {shell: 'bash', cwd: tmpDir}));

    await withErrorLogging(() => execFile(`${scriptsPath}/${type}.bash`, [name], {
      shell: 'bash',
      cwd: `${tmpDir}/${repository.name}`
    }));

    await withErrorLogging(() => exec(`
    set -xeu pipefail

    git push origin main:main
    cd ..
    rm -rvf ${repository.name}
    `, {shell: 'bash', cwd: `${tmpDir}/${repository.name}`}));

  } finally {
    rmSync(tmpDir, {recursive: true});
  }
};
