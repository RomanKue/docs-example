import * as github from '@actions/github';
import * as core from '@actions/core';
import {Issue} from '../response/issue.js';
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types.js';
import {IssueComment} from '../response/issue-comment.js';
import {FullTeam} from '../response/full-team.js';
import {SimpleUser} from '../response/simple-user.js';
import {Label} from '../response/label.js';

export const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined');
  }
  return githubToken;
};

export type RestApi = Api['rest'];
