import * as core from '@actions/core';
import * as github from '@actions/github';

export const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined');
  }
  return githubToken;
};

/**
 * see https://stackoverflow.com/a/11616993/1458343
 */
const safeStringify = (obj: any, indent = 2) => {
  let cache: any[] = [];
  return JSON.stringify(
    obj,
    (key, value) =>
      typeof value === 'object' && value !== null
        ? cache.includes(value)
          ? undefined
          : cache.push(value) && value
        : value,
    indent
  );
};

export const getOctokit = () => {
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
    core.error(`${options.method} ${options.url}\n\n${safeStringify(options)}\nerror message: ${error.message}`);
    throw error;
  });
  return octokit;
};

