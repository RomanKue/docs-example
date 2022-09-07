import {Issue} from '../../../../github/api/issues/response/issue.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import {commentOnIssue, getIssue, lockAnIssue} from '../../../../github/api/issues/issues.js';
import {magicComments} from '../../../config.js';
import {getApprovers} from '../new-app-issue.js';
import {getIssueState, issueState, setIssueState} from '../state.js';
import * as core from '@actions/core';

export const approveIssue = async (
  issue: Issue,
  comment: IssueComment,
): Promise<void> => {
  if (getIssueState(issue) !== issueState.waitingForApproval) {
    return;
  }
  core.info(`approving issue: ${issue.html_url}`);

  const userLogin = comment.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(comment.user, null, 2)} has no login.`);
  }
  const commentBody = (comment.body ?? '').trim();
  if (commentBody === magicComments.lgtm) {
    const approvers = await getApprovers();
    if (approvers.includes(userLogin)) {
      await lockAnIssue(issue);
      await setIssueState(issue, issueState.approved);
    } else {
      const s = approvers.map(a => `@${a}`).join(', ');
      await commentOnIssue({
        body:
          `🚫 @${userLogin} you are not allowed to approve by commenting "${magicComments.lgtm}". Please ask one of the following users to approve this issue: ${s}.`
      });
    }
  }
};

