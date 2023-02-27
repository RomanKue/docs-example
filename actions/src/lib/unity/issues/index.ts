import { Issue } from '../../github/api/issues/response/issue.js';
import { assertUnreachable } from '../../run.js';
import { handleNewAppIssueChange } from './new-app/event-handler.js';
import { handleDecommissionAppIssueChange } from './decommission-app/event-handler.js';
import { getIssueType, issueType } from './issue-type.js';
import { handleNewAppMagicComments } from './new-app/magic-comments-handler.js';
import { IssueComment } from '../../github/api/issues/response/issue-comment.js';

export const handleIssueChange = async (issue: Issue): Promise<void> => {
  const currentIssueType = getIssueType(issue);
  switch (currentIssueType) {
  case issueType.newApp:
    await handleNewAppIssueChange(issue);
    break;
  case issueType.decommissionApp:
    await handleDecommissionAppIssueChange(issue);
    break;
  case null:
    break;
  default:
    assertUnreachable(currentIssueType);
  }
};

export const handleMagicComments = async (issue: Issue, comment: IssueComment) => {
  const currentIssueType = getIssueType(issue);
  switch (currentIssueType) {
  case issueType.newApp:
    await handleNewAppMagicComments(issue, comment);
    break;
  case issueType.decommissionApp:
  case null:
    break;
  default:
    assertUnreachable(currentIssueType);
  }
};

