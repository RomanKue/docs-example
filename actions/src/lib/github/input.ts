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

export type Inputs = GeneralInputs | IssueUpdatedInputs | RecreateAppServiceAccountInputs;

export const getInput = <T extends Inputs> (
  input: T
): string => {
  const inputValue = core.getInput(input);
  if (!inputValue) {
    throw new Error(`${input} is not defined`);
  }
  return inputValue;
};
