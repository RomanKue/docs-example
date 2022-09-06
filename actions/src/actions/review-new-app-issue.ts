/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import {Issue} from '../lib/github/api/issues/response/issue.js';
import {magicComments} from '../lib/unity/config.js';
import {assertUnreachable, handleWorkflowEvent, run} from '../lib/run.js';
import {reviewIssue} from '../lib/unity/custom-issues/new-app/transitions/review.js';
import {requestApproval} from '../lib/unity/custom-issues/new-app/transitions/request-approval.js';
import {IssueComment} from '../lib/github/api/issues/response/issue-comment.js';
import {approveIssue} from '../lib/unity/custom-issues/new-app/transitions/approve.js';
import {getIssueState} from '../lib/unity/custom-issues/new-app/state.js';

const areRunPreconditionsMet = (issue: Issue) => {
  return getIssueState(issue) !== null;
};

const handleIssueChange = async (issue: Issue): Promise<void> => {
  if (!areRunPreconditionsMet(issue)) {
    return;
  }
  const issueState = getIssueState(issue);
  switch (issueState) {
  case 'waiting for review':
    await reviewIssue(issue);
    break;
  case 'waiting for approval':
    await requestApproval(issue);
    break;
  case 'approved':
  case 'delivered':
  case 'stale':
  case null:
    // do nothing
    break;
  default:
    assertUnreachable(issueState);
  }
};

/**
 * certain comments will trigger bot actions, this handler defines which comments are 'magic'
 */
const handleMagicComments = async (issue: Issue, comment: IssueComment) => {
  if (!areRunPreconditionsMet(issue)) {
    return;
  }
  if (comment.user?.login.startsWith('qq')) {
    // don't react on qq-users comments
    return;
  }
  const commentBody = (comment.body ?? '').trim();
  switch (commentBody) {
  case magicComments.check:
    await reviewIssue(issue);
    break;
  case magicComments.lgtm:
    await approveIssue(issue, comment);
    break;
  }
};

run(async () => {
  handleWorkflowEvent({
    issues: handleIssueChange,
    issue_comment: handleMagicComments,
  });
});
