import {hasLabel, labels} from '../../config.js';
import {Issue} from '../../../github/api/issues/response/issue.js';
import {setLabelsForAnIssue} from '../../../github/api/issues/issues.js';
import * as core from '@actions/core';

export const issueState = {
  waitingForReview: labels.waitingForReview,
  waitingForApproval: labels.waitingForApproval,
  approved: labels.approved,
  delivered: labels.delivered,
  stale: labels.stale,
} as const;

export const isNewAppIssue = (
  issue: Readonly<Pick<Issue, 'labels'>>
): boolean => hasLabel(issue, labels.newApp);

export const getIssueState = (
  issue: Readonly<Pick<Issue, 'closed_at' | 'labels'>>
): typeof issueState[keyof typeof issueState] | null => {
  let state: typeof issueState[keyof typeof issueState] | null;
  if (issue.closed_at || !isNewAppIssue(issue)) {
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
export const setIssueState = async (
  issue: Readonly<Pick<Issue, 'number'>>,
  state: typeof issueState[keyof typeof issueState]) => {
  return await setLabelsForAnIssue({
    issue_number: issue.number,
    labels: [labels.newApp, state]
  });
};

