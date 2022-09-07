import {Issue} from './response/issue.js';
import {commentOnIssue} from './issues.js';

export const isClosed = (issue: Readonly<Issue>): boolean => {
  return !!issue.closed_at;
};

export const addSimpleComment = async (issue: Issue, callback: (reporterName: string) => string) => {
  const userLogin = issue.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(issue.user, null, 2)} has no login.`);
  }
  await commentOnIssue({issue_number: issue.number, body: callback(userLogin)});
};

