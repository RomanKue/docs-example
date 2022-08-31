import * as github from '@actions/github';
import * as core from '@actions/core';
import {Issue} from './github/issue.js';
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types.js';
import {IssueComment} from './github/issue-comment.js';
import {issue} from '@actions/core/lib/command.js';

const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not defined');
  }
  return githubToken;
};

type RestApi = Api['rest'];
type IssuesApi = RestApi['issues'];

/**
 * see https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
export const getIssue = async (
  options: Partial<Parameters<IssuesApi['get']>[0]> = {}
): Promise<Issue> => {
  const octokit = github.getOctokit(getGithubToken());
  let response = await octokit.rest.issues.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      ...options
    }
  );
  const issue = response.data as Issue;
  core.debug(`${JSON.stringify(issue, null, 2)}`);
  return issue;
};

/**
 * see https://docs.github.com/en/rest/issues/comments#create-an-issue-comment
 */
export const commentOnIssue = async (
  options: { body: string } & Partial<Parameters<IssuesApi['createComment']>[0]>
): Promise<IssueComment> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  const issueComment = response.data as IssueComment;
  core.debug(`${JSON.stringify(issueComment, null, 2)}`);
  return issueComment;
};
