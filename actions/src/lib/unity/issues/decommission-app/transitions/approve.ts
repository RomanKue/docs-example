import {Issue} from '../../../../github/api/issues/response/issue.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import * as core from '@actions/core';
import {issuesUtils} from '../../../../github/api/issues/index.js';
import {getIssueState, issueState} from '../state.js';

export const approveIssue = async (
  issue: Issue,
  comment: IssueComment,
): Promise<void> => {
  if (getIssueState(issue) !== issueState.waitingForApproval) {
    return;
  }
  core.info(`approving issue: ${issue.html_url}`);
  await issuesUtils.addSimpleComment(issue, user =>
    `😱 @${user} you found a feature, which was not implemented yet, please reach out to the UNITY team.`
  );
};

