import * as github from '@actions/github';
import * as core from '@actions/core';
import {Issue} from '../response/issue.js';
import {IssueComment} from '../response/issue-comment.js';
import {Label} from '../response/label.js';
import {getGithubToken, RestApi} from './rest.js';

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

/**
 * see https://docs.github.com/en/rest/issues/assignees#add-assignees-to-an-issue
 */
export const addAssigneesToAnIssue = async (
  options: { assignees: string[] } & Partial<Parameters<IssuesApi['addAssignees']>[0]>
): Promise<Issue> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.issues.addAssignees({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  const issue = response.data as Issue;
  core.debug(`${JSON.stringify(issue, null, 2)}`);
  return issue;
};

/**
 * see https://docs.github.com/en/rest/issues/assignees#remove-assignees-from-an-issue
 */
export const removeAssigneesFromAnIssue = async (
  options: { assignees: string[] } & Partial<Parameters<IssuesApi['removeAssignees']>[0]>
): Promise<Issue> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.issues.removeAssignees({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  const issue = response.data as Issue;
  core.debug(`${JSON.stringify(issue, null, 2)}`);
  return issue;
};


/**
 * see https://docs.github.com/en/rest/issues/labels#add-labels-to-an-issue
 */
export const addLabelsToAnIssue = async (
  options: { labels: string[] } & Partial<Parameters<IssuesApi['addLabels']>[0]>
): Promise<Label[]> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  const labels = response.data as Label[];
  core.debug(`${JSON.stringify(labels, null, 2)}`);
  return labels;
};

/**
 * see https://docs.github.com/en/rest/issues/labels#remove-a-label-from-an-issue
 */
export const removeALabelFromAnIssue = async (
  options: { name: string } & Partial<Parameters<IssuesApi['removeLabel']>[0]>
): Promise<Label[]> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.issues.removeLabel({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  const labels = response.data as Label[];
  core.debug(`${JSON.stringify(labels, null, 2)}`);
  return labels;
};
