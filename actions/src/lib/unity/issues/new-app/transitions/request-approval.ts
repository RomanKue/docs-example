import {Issue} from '../../../../github/api/issues/response/issue.js';
import * as core from '@actions/core';
import {addAssigneesToAnIssue, commentOnIssue} from '../../../../github/api/issues/issues.js';
import {getIssueState, issueState, setIssueState} from '../../issue-state.js';
import {magicComments, unityBot, unityOrg, unityTeams} from '../../../config.js';
import { getIssueUserLogin } from '../../../../github/api/issues/issues-utils.js';
import { getApprovers } from '../../utils.js';

export const requestApproval = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForReview) {
    return;
  }
  core.info(`requesting approval on issue: ${issue.html_url}`);

  const userLogin = getIssueUserLogin(issue);

  const approvers = await getApprovers();
  if (approvers.includes(userLogin)) {
    // if requester is in the unityAppApproversTeam, we can skip the approval request process and approve directly
    await setIssueState(issue, issueState.approved);
  } else {
    await addAssigneesToAnIssue({assignees: approvers});
    await commentOnIssue({
      body: `@${unityOrg}/${unityTeams.unityAppApproversSlug} this issue requires your approval.
      Please comment with "@${unityBot} ${magicComments.lgtm}", so I can start shipping the new UNITY app.`
    });
    await setIssueState(issue, issueState.waitingForApproval);
  }
};
