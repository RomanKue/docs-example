import {Issue} from '../../../../github/api/issues/response/issue.js';
import * as core from '@actions/core';
import {addAssigneesToAnIssue} from '../../../../github/api/issues/issues.js';
import {getApprovers} from '../new-app-issue.js';
import {getIssueState, issueState, setIssueState} from '../state.js';

export const requestApproval = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForApproval) {
    return;
  }
  core.info(`requesting approval`);

  const userLogin = issue.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(issue.user, null, 2)} has no login.`);
  }

  const approvers = await getApprovers();
  if (approvers.includes(userLogin)) {
    // if requester is in the unityAppApproversTeam, we can skip the approval request process and approve directly
    await setIssueState(issue, issueState.approved);
  } else {
    await addAssigneesToAnIssue({assignees: approvers});
    await setIssueState(issue, issueState.waitingForApproval);
  }
};
