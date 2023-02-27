import {Issue} from '../../../../github/api/issues/response/issue.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import {commentOnIssue} from '../../../../github/api/issues/issues.js';
import {isMagicComment, magicComments} from '../../../config.js';
import * as core from '@actions/core';
import { getIssueState, issueState, setIssueState } from '../../issue-state.js';
import { getApprovers } from '../../utils.js';

export const approveIssue = async (
  issue: Issue,
  comment: IssueComment,
): Promise<void> => {
  if (getIssueState(issue) !== issueState.waitingForApproval) {
    return;
  }
  core.info(`approving issue: ${issue.html_url}`);

  const commentUser = comment.user?.login as string;

  if (isMagicComment(comment, magicComments.lgtm)) {
    const approvers = await getApprovers();
    if (approvers.includes(commentUser)) {
      await setIssueState(issue, issueState.approved);
    } else {
      const s = approvers.map(a => `@${a}`).join(', ');
      await commentOnIssue({
        body:
          `🚫 @${commentUser} you are not allowed to approve by commenting "${magicComments.lgtm}". Please ask one of the following users to approve this issue: ${s}.`
      });
    }
  }
};

