/**
 * General configuration of the UNITY org in GitHub.
 */

import {Issue} from '../github/api/issues/response/issue.js';
import {IssueComment} from '../github/api/issues/response/issue-comment.js';

/** name of the org */
export const unityOrg = 'UNITY';
export const containerRegistry = 'containers.atc-github.azure.cloud.bmw';

/**
 * @see https://atc-github.azure.cloud.bmw/organizations/UNITY/settings/roles
 */
export const unityRepositoryRoles = 'app-admin';

export const isUnityBotComment = (comment: Readonly<Pick<IssueComment, 'user'>>): boolean => {
  return comment.user?.login.toLocaleLowerCase() == unityBot;
};


/**
 * @see https://atc-github.azure.cloud.bmw/qqunit1
 */
export const unityBot = `qqunit1`;

export const makeStubWorkflowId = 'make-stub.yaml';

/**
 * teams available in the UNITY org
 * @see https://atc-github.azure.cloud.bmw/orgs/UNITY/teams
 */
export const unityTeams = {
  unityAppApproversSlug: 'unity-app-approvers',
} as const;


/**
 * labels available in UNITY/unity
 * @see https://atc-github.azure.cloud.bmw/UNITY/unity/issues/labels
 */
export const labels = {
  newApp: 'new app',
  waitingForReview: 'waiting for review',
  waitingForApproval: 'waiting for approval',
  approved: 'approved',
  delivered: 'delivered',
  stale: 'stale',
} as const;

export const repos = {
  appPrefix: 'app-'
} as const;

export const defaultBranches = {
  int: 'int',
  prod: 'prod',
} as const;

export const defaultTopics = {
  unityApp: 'unity-app',
} as const;

export const magicComments = {
  review: 'review',
  lgtm: 'LGTM',
} as const;

export const isMagicComment = (
  comment: IssueComment,
  magicComment: typeof magicComments[keyof typeof magicComments]
): boolean => {
  const commentBody = comment.body?.trim() ?? '';
  let ok = true;
  // must include bot mention
  ok &&= commentBody.includes(`@${unityBot}`);
  // must include keyword
  ok &&= commentBody.includes(magicComment);
  return ok;
};
export const hasLabel = (
  issue: Readonly<Pick<Issue, 'labels'>>
  , label: typeof labels[keyof typeof labels]): boolean => {
  return issue.labels.map(l => l?.name).includes(label);
};

