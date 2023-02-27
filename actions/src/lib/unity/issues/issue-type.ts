import { hasLabel, labels } from '../config.js';
import * as core from '@actions/core';
import { Issue } from '../../github/api/issues/response/issue.js';

export const issueType = {
  newApp: labels.newApp,
  decommissionApp: labels.decommissionApp,
} as const;

export type IssueType = typeof issueType[keyof typeof issueType];

export const getIssueType = (issue: Issue): IssueType | null => {
  let type: IssueType | null;
  if (isNewAppIssue(issue)) {
    type = issueType.newApp;
  } else if (isDecommissionAppIssue(issue)) {
    type = issueType.decommissionApp;
  } else {
    type = null;
  }
  core.info(`issue is of type: ${type}`);
  return type;
};

export const isNewAppIssue = (
  issue: Readonly<Pick<Issue, 'labels'>>
): boolean => hasLabel(issue, labels.newApp);

export const isDecommissionAppIssue = (
  issue: Readonly<Pick<Issue, 'labels'>>
): boolean => hasLabel(issue, labels.decommissionApp);
