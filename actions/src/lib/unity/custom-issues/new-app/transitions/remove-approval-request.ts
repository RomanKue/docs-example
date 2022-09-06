import {Issue} from '../../../../github/api/issues/response/issue.js';
import {getApprovers} from '../new-app-issue.js';
import * as core from '@actions/core';
import {IssueUtils, removeAssigneesFromAnIssue} from '../../../../github/api/issues/issues.js';
import {getIssueState, issueState, setIssueState} from '../state.js';
import addSimpleComment = IssueUtils.addSimpleComment;

export const removeApprovalRequest = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForApproval) {
    return;
  }
  core.info(`removing approval request`);
  await addSimpleComment(issue, (user) =>
    `❓@${user} the issue does not seem to be ready for approval anymore, so I am removing the approval request for now. As soon as the issue is ready, I will request approval again for you.`
  );
  await setIssueState(issue, issueState.waitingForReview)
  const assignees = await getApprovers();
  await removeAssigneesFromAnIssue({assignees});
};

