import {Issue} from '../../../github/api/issues/response/issue.js';
import {assertUnreachable} from '../../../run.js';
import {IssueComment} from '../../../github/api/issues/response/issue-comment.js';
import {isUnityBotComment} from '../../config.js';
import * as core from '@actions/core';
import {getIssueState, isDecommissionAppIssue} from './state.js';

export const handleIssueChange = async (issue: Issue): Promise<void> => {
  const issueState = getIssueState(issue);
  switch (issueState) {
  case 'waiting for review':
    throw new Error(`not implemented`);
    break;
  case 'waiting for approval':
    throw new Error(`not implemented`);
    break;
  case 'approved':
    throw new Error(`not implemented`);
    break;
  case 'delivered':
  case null:
    // do nothing
    break;
  default:
    assertUnreachable(issueState);
  }
};

/**
 * certain comments will trigger bot actions, this handler defines which comments are 'magic'
 */
export const handleMagicComments = async (issue: Issue, comment: IssueComment) => {
  if (!isDecommissionAppIssue(issue)) {
    core.info(`ignoring comment, since this issue is not a decommission-app issue.`);
    return;
  }
  if (isUnityBotComment(comment)) {
    // don't react on unity bot comments
    core.info(`ignoring comment, since it is a comment from myself.`);
    return;
  }
  throw new Error(`not implemented`);
};
