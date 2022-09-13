import {Issue} from '../../../../github/api/issues/response/issue.js';
import * as core from '@actions/core';
import {getIssueState, issueState} from '../state.js';
import {issuesUtils} from '../../../../github/api/issues/index.js';

export const requestApproval = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForReview) {
    return;
  }
  core.info(`requesting approval on issue: ${issue.html_url}`);
  await issuesUtils.addSimpleComment(issue, user =>
    `😱 @${user} you found a feature, which was not implemented yet, please reach out to the UNITY team.`
  );
};
