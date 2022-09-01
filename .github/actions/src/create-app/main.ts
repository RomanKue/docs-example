/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';

const run = async () => {
};

run().catch(e => {
  if (e instanceof Error) {
    core.error(`${e.message}\n${e.stack}`);
    core.setFailed(e.message);
  } else {
    core.setFailed(e);
  }
});
