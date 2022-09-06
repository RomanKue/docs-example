import {hasLabel, labels} from '../../config.js';
import {Issue} from '../../../github/api/issues/response/issue.js';
import {setLabelsForAnIssue} from '../../../github/api/issues/issues.js';

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
  if (issue.closed_at || !isNewAppIssue(issue)) {
    return null;
  }
  if (hasLabel(issue, labels.waitingForReview)) {
    return issueState.waitingForReview;
  }
  if (hasLabel(issue, labels.waitingForApproval)) {
    return issueState.waitingForApproval;
  }
  if (hasLabel(issue, labels.approved)) {
    return issueState.approved;
  }
  if (hasLabel(issue, labels.delivered)) {
    return issueState.delivered;
  }
  throw new Error(`could not determine issue state of ${issue}`);
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

