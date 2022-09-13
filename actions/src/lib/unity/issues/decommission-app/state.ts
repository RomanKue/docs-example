import {Issue} from '../../../github/api/issues/response/issue.js';
import {hasLabel, labels} from '../../config.js';
import * as core from '@actions/core';
import {issueState} from '../new-app/index.js';

export const isDecommissionAppIssue = (
  issue: Readonly<Pick<Issue, 'labels'>>
): boolean => hasLabel(issue, labels.decommissionApp);

export const getIssueState = (
  issue: Readonly<Pick<Issue, 'closed_at' | 'labels'>>
): typeof issueState[keyof typeof issueState] | null => {
  let state: typeof issueState[keyof typeof issueState] | null;
  if (issue.closed_at || !isDecommissionAppIssue(issue)) {
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
