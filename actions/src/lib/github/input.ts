import * as core from '@actions/core';

export const getInput = (
  input:
    'working-directory' |
    'GITHUB_TOKEN' |
    'INT_KUBERNETES_TOKEN' |
    'INT_KUBERNETES_HOST' |
    'INT_KUBERNETES_NAMESPACE' |
    'PROD_KUBERNETES_TOKEN' |
    'PROD_KUBERNETES_HOST' |
    'PROD_KUBERNETES_NAMESPACE'
): string => {
  const inputValue = core.getInput(input);
  if (!inputValue) {
    throw new Error(`${input} is not defined`);
  }
  return inputValue;
};
