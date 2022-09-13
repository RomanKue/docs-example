import {Issue} from '../../../../github/api/issues/response/issue.js';
import {getIssueState, issueState} from '../state.js';
import * as core from '@actions/core';
import {issuesUtils} from '../../../../github/api/issues/index.js';


export const deliver = async (
  issue: Issue,
): Promise<void> => {
  if (getIssueState(issue) !== issueState.approved) {
    return;
  }
  core.info(`deliver app for issue: ${issue.html_url}`);
  await issuesUtils.addSimpleComment(issue, user =>
    `😱 @${user} you found a feature, which was not implemented yet, please reach out to the UNITY team.`
  );
};

