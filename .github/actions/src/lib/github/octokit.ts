import * as core from '@actions/core';
import * as github from '@actions/github';
import {Octokit} from '@octokit/rest';

export const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined');
  }
  return githubToken;
};

export const getOctokit = () => {
  return new Octokit({
    auth: getGithubToken(),
    baseUrl: github.context.apiUrl,
    log: {
      debug: message => core.debug(message),
      info: message => core.info(message),
      warn: message => core.warning(message),
      error: message => core.error(message),
    },
  });
};

