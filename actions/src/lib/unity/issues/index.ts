import {Issue} from '../../github/api/issues/response/issue.js';
import {isNewAppIssue, issueType} from './new-app/index.js';
import {assertUnreachable} from '../../run.js';
import * as core from '@actions/core';
import {isDecommissionAppIssue} from './decommission-app/state.js';
import {handleNewAppIssueChange, handleNewAppMagicComments} from './new-app/event-handler.js';
import {
  handleDecommissionAppIssueChange,
  handleDecommissionAppMagicComments
} from './decommission-app/event-handler.js';
import {IssueComment} from '../../github/api/issues/response/issue-comment.js';

export const getIssueType = (issue: Issue) => {
  let type: typeof issueType[keyof typeof issueType] | null;
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

export const handleIssueChange = async (issue: Issue): Promise<void> => {
  const issueType = getIssueType(issue);
  switch (issueType) {
  case 'new app':
    await handleNewAppIssueChange(issue);
    break;
  case 'decommission app':
    await handleDecommissionAppIssueChange(issue);
    break;
  case null:
    break;
  default:
    assertUnreachable(issueType);
  }
};

export const handleMagicComments = async (issue: Issue, comment: IssueComment) => {
  const issueType = getIssueType(issue);
  switch (issueType) {
  case 'new app':
    await handleNewAppMagicComments(issue, comment);
    break;
  case 'decommission app':
    await handleDecommissionAppMagicComments(issue, comment);
    break;
  case null:
    break;
  default:
    assertUnreachable(issueType);
  }
};
