import * as core from '@actions/core';

export type GeneralInputs = 'working-directory';

export type IssueUpdatedInputs =
  'working-directory' |
  'GITHUB_TOKEN' |
  'INT_KUBERNETES_TOKEN' |
  'INT_KUBERNETES_HOST' |
  'INT_KUBERNETES_NAMESPACE' |
  'PROD_KUBERNETES_TOKEN' |
  'PROD_KUBERNETES_HOST' |
  'PROD_KUBERNETES_NAMESPACE';

export type RecreateAppServiceAccountInputs =
  'GITHUB_TOKEN' |
  'KUBERNETES_TOKEN' |
  'KUBERNETES_HOST' |
  'KUBERNETES_NAMESPACE' |
  'repository-regex' |
  'environment';

export type RecreateAppWorkflowsInputs =
  'repository-regex' |
  'branch' |
  'title' |
  'body';

export type SyncMasterKeysInputs =
  'GITHUB_TOKEN' |
  'KUBERNETES_TOKEN' |
  'KUBERNETES_HOST' |
  'KUBERNETES_NAMESPACE' |
  'repository-regex' |
  'environment' |
  'overwrite' |
  'master-key-secret-suffix';

export type Inputs = GeneralInputs | IssueUpdatedInputs | RecreateAppServiceAccountInputs | RecreateAppWorkflowsInputs | SyncMasterKeysInputs;

export const getInput = <T extends Inputs>(
  input: T
): string => {
  const inputValue = core.getInput(input);
  if (!inputValue) {
    throw new Error(`${input} is not defined`);
  }
  return inputValue;
};
