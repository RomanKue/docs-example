import * as core from '@actions/core';
import { Issue } from '../../../../github/api/issues/response/issue.js';
import { getIssueState, issueState } from '../../issue-state.js';
import { DecommissionAppIssue, parseIssueBody } from '../decommission-app-issue.js';
import { validateDecommissionAppIssue } from '../validation.js';
import { deliver } from './deliver.js';

export const reviewDecommissionAppIssue = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForReview) {
    return;
  }
  core.info(`reviewing issue: ${issue.html_url}`);

  const decommissionAppIssue: DecommissionAppIssue = parseIssueBody(issue.body ?? '');
  const isValid = await validateDecommissionAppIssue(decommissionAppIssue, issue);
  if (!isValid) {
    return;
  }

  await deliver(issue, decommissionAppIssue);
};

