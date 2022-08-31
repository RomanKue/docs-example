import * as github from '@actions/github';
import * as core from '@actions/core';
import {Issue} from './github/issue.js';
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types.js';

const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined');
  }
  return githubToken;
};

export const getIssue = async (options: Partial<Parameters<Api["rest"]['issues']['get']>[0]> = {}) => {
  const octokit = github.getOctokit(getGithubToken());
  let issue = (await octokit.rest.issues.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      ...options
    }
  )).data as Issue;
  core.debug(`${JSON.stringify(issue, null, 2)}`);
  return issue;
};
