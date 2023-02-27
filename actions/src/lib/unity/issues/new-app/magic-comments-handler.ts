import { Issue } from '../../../github/api/issues/response/issue.js';
import { IssueComment } from '../../../github/api/issues/response/issue-comment.js';
import { isMagicComment, isUnityBotComment, labels, magicComments, unityBot } from '../../config.js';
import * as core from '@actions/core';
import { getIssueType, issueType } from '../issue-type.js';
import { commentOnIssue } from '../../../github/api/issues/issues.js';
import { getIssueState, issueState } from '../issue-state.js';
import { reviewIssue } from './transitions/review.js';
import { reviewDecommissionAppIssue } from '../decommission-app/transitions/review.js';
import { approveIssue } from './transitions/approve.js';

export const handleNewAppMagicComments = async (issue: Issue, comment: IssueComment) => {
  if (isUnityBotComment(comment)) {
    // don't react on unity bot comments
    core.info(`ignoring comment, since it is a comment from myself.`);
    return;
  }
  const currentIssueType = getIssueType(issue);
  if (currentIssueType !== issueType.newApp) {
    core.info(`ignoring comment, since this issue is not a new-app issue.`);
    // don't react on unknown issue types
    return;
  }

  const commenter = comment.user?.login;
  if (isMagicComment(comment, magicComments.review)) {
    await handleReviewMagicComment(issue, commenter, currentIssueType);
    return;
  }

  if (isMagicComment(comment, magicComments.lgtm)) {
    await handleLgtmMagikComment(issue, commenter, comment);
  }

  if (comment.body ?? ''.includes(`@${unityBot}`)) {
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

const handleReviewMagicComment = async (issue: Issue, commenter: string | undefined, currentIssueType: 'new app' | 'decommission app') => {
  if (getIssueState(issue) !== issueState.waitingForReview) {
    await commentOnIssue({
      body:
        `@${commenter} I understood that you want me to review your issue again.
        Unfortunately, I can't review your issue, as it is not labeled with "${labels.waitingForReview}".`
    });
    return;
  }
  await commentOnIssue({
    body:
      `@${commenter} I understood that you want me to review your issue again, I will start with that right away... `
  });
  switch (currentIssueType) {
  case issueType.newApp:
    await reviewIssue(issue);
    break;
  case issueType.decommissionApp:
    await reviewDecommissionAppIssue(issue);
    break;
  }
};

const handleLgtmMagikComment = async (issue: Issue, commenter: string | undefined, comment: IssueComment): Promise<void> => {
  if (getIssueState(issue) === issueState.waitingForApproval) {
    await commentOnIssue({
      body:
        `@${commenter} I understood that you want me to approve the issue.`
    });
    await approveIssue(issue, comment);
    return;
  }
  await commentOnIssue({
    body:
      `@${commenter} I understood that you want to approve the issue.
      Unfortunately, I can't approve your issue, as it is not labeled with "${labels.waitingForApproval}".`
  });
};
