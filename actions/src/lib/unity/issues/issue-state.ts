import { hasLabel, labels } from '../config.js';
import { Issue } from '../../github/api/issues/response/issue.js';
import * as core from '@actions/core';
import { setLabelsForAnIssue } from '../../github/api/issues/issues.js';
import { getIssueType } from './issue-type.js';

export const issueState = {
  waitingForReview: labels.waitingForReview,
  waitingForApproval: labels.waitingForApproval,
  approved: labels.approved,
  delivered: labels.delivered,
} as const;

export type IssueState = typeof issueState[keyof typeof issueState];

export const getIssueState = (issue: Issue): IssueState | null => {
  let state: IssueState | null;
  if (issue.closed_at || !getIssueType(issue)) {
    state = null;
  } else if (hasLabel(issue, labels.waitingForReview)) {
    state = issueState.waitingForReview;
  } else if (hasLabel(issue, labels.waitingForApproval)) {
    state = issueState.waitingForApproval;
  } else if (hasLabel(issue, labels.approved)) {
    state = issueState.approved;
  } else if (hasLabel(issue, labels.delivered)) {
    state = issueState.delivered;
  } else {
    throw new Error(`could not determine issue state of ${issue}`);
  }
  core.info(`issue is in state: ${state}`);
  return state;
};

/**
 * set labels on an issue to reflect a certain status
 */
export const setIssueState = async (issue: Issue, state: IssueState) => {
  const issueType = getIssueType(issue);
  if (!issueType) {
    throw new Error(`could not determine issue type of ${issue}`);
  }
  return await setLabelsForAnIssue({
    issue_number: issue.number,
    labels: [issueType, state]
  });
};
