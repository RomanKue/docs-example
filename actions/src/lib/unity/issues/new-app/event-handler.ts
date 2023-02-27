import { Issue } from '../../../github/api/issues/response/issue.js';
import { reviewIssue } from './transitions/review.js';
import { requestApproval } from './transitions/request-approval.js';
import { assertUnreachable } from '../../../run.js';
import { deliver } from './transitions/deliver.js';
import { getIssueState } from '../issue-state.js';

export const handleNewAppIssueChange = async (issue: Issue): Promise<void> => {
  const issueState = getIssueState(issue);
  switch (issueState) {
  case 'waiting for review':
    await reviewIssue(issue);
    break;
  case 'waiting for approval':
    await requestApproval(issue);
    break;
  case 'approved':
    await deliver(issue);
    break;
  case 'delivered':
  case null:
    // do nothing
    break;
  default:
    assertUnreachable(issueState);
  }
};
