/**
 * General configuration of the UNITY org in GitHub.
 */

import {Issue} from '../github/api/issues/response/issue.js';
import {IssueComment} from '../github/api/issues/response/issue-comment.js';
import {repoName} from './app-spec.js';

/**constants for string default description and display name */
export const displayNameDefault = 'Nice App Name';
export const descriptionDefault = 'Here is the description for the app catalog, which will be displayed there. If you don\'t provide one, the one from Connect IT will be taken.';

/** name of the org */
export const unityOrg = 'UNITY';

export const repoUrl = (appName: string | undefined) => `https://atc-github.azure.cloud.bmw/${unityOrg}/${repoName(appName)}`;

/**
 * @see https://atc-github.azure.cloud.bmw/organizations/UNITY/settings/roles
 */
export const unityAppAdminRole = 'app-admin';
export const adminPermission = 'admin';

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
  decommissionApp: 'decommission app',
  waitingForReview: 'waiting for review',
  waitingForApproval: 'waiting for approval',
  approved: 'approved',
  delivered: 'delivered',
  stale: 'stale',
} as const;

export const repos = {
  appPrefix: 'app-'
} as const;

export const angularStubName = 'ui';
export const quarkusStubName = 'api';

export const javaVersion = 17;
export const javaDistribution = 'zulu';
export const nodeVersion = '18';

export const allEnvironments = {
  test: 'test',
  int: 'int',
  prod: 'prod',
} as const;

/**
 * environments to be used by the apps
 */
export const appEnvironments = {
  int: allEnvironments.int,
  prod: allEnvironments.prod,
} as const;

export const githubSecretKeys = {
  kubernetesToken: 'KUBERNETES_TOKEN',
  kubernetesHost: 'KUBERNETES_HOST',
  kubernetesNamespace: 'KUBERNETES_NAMESPACE',
  cryptMasterKey: 'CRYPT_MASTER_KEY',
} as const;

export const defaultTopics = {
  unityApp: 'unity-app',
} as const;

export const magicComments = {
  review: 'review',
  lgtm: 'LGTM',
} as const;

export const k8sSecretConstants = {
  masterKeyV1Suffix: '-master-key.v1',
  masterKeyV2Suffix: '-master-key.v2',
  masterKey: 'master-key'
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

