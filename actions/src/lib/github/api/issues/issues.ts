import * as github from '@actions/github';
import {Issue} from './response/issue.js';
import {IssueComment} from './response/issue-comment.js';
import {Label} from './response/label.js';
import {RestApi} from '../rest.js';
import {getOctokit} from '../../octokit.js';

type IssuesApi = RestApi['issues'];

/**
 * see https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
export const getIssue = async (
  options: Partial<Parameters<IssuesApi['get']>[0]> = {}
): Promise<Issue> => {
  const response = await getOctokit().rest.issues.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      ...options
    }
  );
  return response.data as Issue;
};

/**
 * see https://docs.github.com/en/rest/issues/comments#create-an-issue-comment
 */
export const commentOnIssue = async (
  options: { body: string } & Partial<Parameters<IssuesApi['createComment']>[0]>
): Promise<IssueComment> => {
  const response = await getOctokit().rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  return response.data as IssueComment;
};

/**
 * see https://docs.github.com/en/rest/issues/assignees#add-assignees-to-an-issue
 */
export const addAssigneesToAnIssue = async (
  options: { assignees: string[] } & Partial<Parameters<IssuesApi['addAssignees']>[0]>
): Promise<Issue> => {
  const response = await getOctokit().rest.issues.addAssignees({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  return response.data as Issue;
};

/**
 * see https://docs.github.com/en/rest/issues/issues#update-an-issue
 */
export const updateAnIssue = async (
  options: Partial<Parameters<IssuesApi['update']>[0]>
): Promise<Issue> => {
  const response = await getOctokit().rest.issues.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  return response.data as Issue;
};

/**
 * see https://docs.github.com/en/rest/issues/issues#lock-an-issue
 */
export const lockAnIssue = async (
  options: Partial<Parameters<IssuesApi['lock']>[0]>
): Promise<void> => {
  const response = await getOctokit().rest.issues.lock({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
};

/**
 * see https://docs.github.com/en/rest/issues/assignees#remove-assignees-from-an-issue
 */
export const removeAssigneesFromAnIssue = async (
  options: { assignees: string[] } & Partial<Parameters<IssuesApi['removeAssignees']>[0]>
): Promise<Issue> => {
  const response = await getOctokit().rest.issues.removeAssignees({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  return response.data as Issue;
};


/**
 * see https://docs.github.com/en/rest/issues/labels#add-labels-to-an-issue
 */
export const addLabelsToAnIssue = async (
  options: { labels: string[] } & Partial<Parameters<IssuesApi['addLabels']>[0]>
): Promise<Label[]> => {
  const response = await getOctokit().rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  return response.data as Label[];
};

/**
 * see https://docs.github.com/en/rest/issues/labels#remove-a-label-from-an-issue
 */
export const removeALabelFromAnIssue = async (
  options: { name: string } & Partial<Parameters<IssuesApi['removeLabel']>[0]>
): Promise<Label[]> => {
  const response = await getOctokit().rest.issues.removeLabel({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    ...options
  });
  return response.data as Label[];
};
