import * as core from '@actions/core';
import * as github from '@actions/github';

/**
 * wrapper for main functions with error handling and global debug logging
 */
export const run = async (callback: () => Promise<void>) => {
  core.debug(`cwd: ${process.cwd()}`);
  core.debug(`context: ${JSON.stringify(github.context, null, 2)}`);
  try {
    await callback();
  } catch (e) {
    if (e instanceof Error) {
      core.error(`${e.message}\n${e.stack}`);
      core.setFailed(e.message);
    } else {
      core.setFailed(e as any);
    }
  }
};
