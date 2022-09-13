import {Issue} from '../../../../github/api/issues/response/issue.js';
import {getApprovers} from '../new-app-issue.js';
import * as core from '@actions/core';
import {getIssueState, issueState, setIssueState} from '../state.js';
import issues, {issuesUtils} from '../../../../github/api/issues/index.js';

export const removeApprovalRequest = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForApproval) {
    return;
  }
  core.info(`removing approval request from issue: ${issue.html_url}`);
  await issuesUtils.addSimpleComment(issue, user =>
    `❓@${user} the issue does not seem to be ready for approval anymore, so I am removing the approval request for now. As soon as the issue is ready, I will request approval again for you.`
  );
  await setIssueState(issue, issueState.waitingForReview);
  const assignees = await getApprovers();
  await issues.removeAssigneesFromAnIssue({assignees});
};
