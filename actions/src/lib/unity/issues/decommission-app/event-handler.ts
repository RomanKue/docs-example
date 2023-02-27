import { Issue } from '../../../github/api/issues/response/issue.js';
import { assertUnreachable } from '../../../run.js';
import { getIssueState, issueState } from './../issue-state.js';
import { reviewDecommissionAppIssue } from './transitions/review.js';

export const handleDecommissionAppIssueChange = async (issue: Issue): Promise<void> => {
  const currentIssueState = getIssueState(issue);
  switch (currentIssueState) {
  case issueState.waitingForReview:
    await reviewDecommissionAppIssue(issue);
    break;
  case issueState.waitingForApproval:
  case issueState.approved:
  case issueState.delivered:
  case null:
    // do nothing
    break;
  default:
    assertUnreachable(currentIssueState);
  }
};
