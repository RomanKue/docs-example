import {Issue} from '../../../github/api/issues/response/issue.js';
import {getIssueState, isNewAppIssue, issueState} from './state.js';
import {reviewIssue} from './transitions/review.js';
import {requestApproval} from './transitions/request-approval.js';
import {assertUnreachable} from '../../../run.js';
import {IssueComment} from '../../../github/api/issues/response/issue-comment.js';
import {isMagicComment, isUnityBotComment, labels, magicComments, unityBot} from '../../config.js';
import * as core from '@actions/core';
import {approveIssue} from './transitions/approve.js';
import {deliver} from './transitions/deliver.js';
import {commentOnIssue} from '../../../github/api/issues/issues.js';

export const handleNewAppIssueChange = async (issue: Issue): Promise<void> => {
  const issueState = getIssueState(issue);
  switch (issueState) {
  case 'waiting for review':
    await reviewIssue(issue);
    break;
  case 'waiting for approval':
    await requestApproval(issue);
    break;
  case 'approved':
    await deliver(issue);
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
export const handleNewAppMagicComments = async (issue: Issue, comment: IssueComment) => {
  if (!isNewAppIssue(issue)) {
    core.info(`ignoring comment, since this issue is not a new-app issue.`);
    return;
  }
  if (isUnityBotComment(comment)) {
    // don't react on unity bot comments
    core.info(`ignoring comment, since it is a comment from myself.`);
    return;
  }
  const commenter = comment.user?.login;
  if (isMagicComment(comment, magicComments.review)) {
    if (getIssueState(issue) === issueState.waitingForReview) {
      await commentOnIssue({
        body:
          `@${commenter} I understood that you want me to review your issue again, I will start with that right away... `
      });
      await reviewIssue(issue);
    } else {
      await commentOnIssue({
        body:
          `@${commenter} I understood that you want me to review your issue again.
        Unfortunately, I can't review your issue, as it is not labeled with "${labels.waitingForReview}".`
      });
    }
  } else if (isMagicComment(comment, magicComments.lgtm)) {
    if (getIssueState(issue) === issueState.waitingForApproval) {
      await commentOnIssue({
        body:
          `@${commenter} I understood that you want me to approve the issue.`
      });
      await approveIssue(issue, comment);
    } else {
      await commentOnIssue({
        body:
          `@${commenter} I understood that you want to approve the issue.
        Unfortunately, I can't approve your issue, as it is not labeled with "${labels.waitingForApproval}".`
      });
    }
  } else if (comment.body ?? ''.includes(`@${unityBot}`)) {
    const possibleComments =
      ` * @${unityBot} ${magicComments.review}\n` +
      ` * @${unityBot} ${magicComments.lgtm}\n` +
      ``;
    await commentOnIssue({
      body:
        `@${commenter} I am not sure I can help you with your request. Try one of the following comments:\n\n${possibleComments}`
    });
  }
};
