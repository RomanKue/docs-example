import {Issue} from './response/issue.js';
import {commentOnIssue} from './issues.js';
import {ReadonlyDeep} from 'type-fest';

export const isClosed = (issue: Readonly<Issue>): boolean => {
  return !!issue.closed_at;
};

export const addSimpleComment = async (issue: ReadonlyDeep<Issue>, callback: (reporterName: string) => string) => {
  const userLogin = getIssueUserLogin(issue);
  await commentOnIssue({issue_number: issue.number, body: callback(userLogin)});
};

export const getIssueUserLogin = (issue: ReadonlyDeep<Issue>): string => {
  const userLogin = issue.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(issue.user, null, 2)} has no login.`);
  }

  return userLogin;
};

