import * as core from '@actions/core';
import * as github from '@actions/github';
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types.js';

export const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined');
  }
  return githubToken;
};

export const getOctokitApi = (): Api => {
  const octokit = github.getOctokit(getGithubToken(), {
    log: {
      debug: message => core.debug(message),
      info: message => core.info(message),
      warn: message => core.warning(message),
      error: message => core.error(message),
    },
  });
  octokit.hook.after('request', async (response, options) => {
    core.info(`${options.method} ${options.url} - ${response.status}`);
    core.debug(`${JSON.stringify(response, null, 2)}`);
  });
  octokit.hook.error('request', async (error, options) => {
    core.error(`${options.method} ${options.url}\n\n${JSON.stringify(Object.keys(options), null, 2)}\nerror message: ${error.message}`);
    throw error;
  });
  return octokit;
};

