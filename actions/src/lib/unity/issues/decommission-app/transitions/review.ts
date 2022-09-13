import * as core from '@actions/core';
import {issuesUtils} from '../../../../github/api/issues/index.js';
import {Issue} from '../../../../github/api/issues/response/issue.js';
import {getIssueState, issueState} from '../state.js';

export const reviewIssue = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForReview) {
    return;
  }
  core.info(`reviewing issue: ${issue.html_url}`);
  await issuesUtils.addSimpleComment(issue, user =>
    `😱 @${user} you found a feature, which was not implemented yet, please reach out to the UNITY team.`
  );
};

