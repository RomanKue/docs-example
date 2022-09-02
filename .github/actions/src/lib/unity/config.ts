/**
 * General configuration of the UNITY org in GitHub.
 */

/**
 * teams available in the UNITY org
 * @see https://atc-github.azure.cloud.bmw/orgs/UNITY/teams
 */
export const teams = {
  unityAppApproversSlug: 'unity-app-approvers',
} as const;

/**
 * labels available in UNITY/unity
 * @see https://atc-github.azure.cloud.bmw/UNITY/unity/issues/labels
 */
export const labels = {
  newApp: 'new app',
  waitingForApproval: 'waiting for approval',
  approved: 'approved',
} as const;

/**
 * workflows available in UNITY/unity which can be dispatched via workflow_dispatch
 * @see https://atc-github.azure.cloud.bmw/UNITY/unity/actions
 */
export const workflows = {
  createApp : 'create-app.yaml',
} as const;
