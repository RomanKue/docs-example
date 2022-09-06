/**
 * General configuration of the UNITY org in GitHub.
 */

import {Issue} from '../github/api/issues/response/issue.js';

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
  check: 'check',
  lgtm: 'LGTM',
} as const;

export const hasLabel = (
  issue: Readonly<Pick<Issue, 'labels'>>
  , label: typeof labels[keyof typeof labels]): boolean => {
  return issue.labels.map(l => l?.name).includes(label);
};

