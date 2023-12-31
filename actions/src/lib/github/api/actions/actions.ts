import {RestApi} from '../rest.js';
import * as github from '@actions/github';
import {getOctokitApi} from '../../octokit.js';
import {ActionsPublicKey} from './response/actions-public-key.js';
import {WorkflowRuns} from './response/workflow-runs.js';
import {ActionsSecret} from './response/actions-secret.js';

export type ActionsApi = RestApi['actions'];

/**
 * see https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
 */
export const createAWorkflowDispatchEvent = async (
  options: {
    workflow_id: string,
    ref: string
  } & Partial<Parameters<ActionsApi['createWorkflowDispatch']>[0]>
): Promise<void> => {
  await getOctokitApi().rest.actions.createWorkflowDispatch({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
};

/**
 * see https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow
 */
export const listWorkflowRunsForAWorkflow = async (
  options: {
    workflow_id: string,
  } & Partial<Parameters<ActionsApi['listWorkflowRuns']>[0]>
): Promise<WorkflowRuns> => {
  const response = await getOctokitApi().rest.actions.listWorkflowRuns({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as WorkflowRuns;
};

/**
 * https://docs.github.com/en/rest/actions/secrets#create-or-update-an-environment-secret
 */
export const createOrUpdateAnEnvironmentSecret = async (
  options: {
    encrypted_value: string,
    environment_name: string,
    key_id: string,
    repository_id: number,
    secret_name: string,
  } & Partial<Parameters<ActionsApi['createOrUpdateEnvironmentSecret']>[0]>
): Promise<void> => {
  await getOctokitApi().rest.actions.createOrUpdateEnvironmentSecret({
    ...options
  });
};

/**
 * @see https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28#delete-an-environment-secret
 */
export const deleteAnEnvironmentSecret = async (
  options: {
    repository_id: number,
    environment_name: string,
    secret_name: string,
  } & Partial<Parameters<ActionsApi['deleteEnvironmentSecret']>[0]>
): Promise<void> => {
  await getOctokitApi().rest.actions.deleteEnvironmentSecret({
    ...options
  });
};

/**
 * https://docs.github.com/en/rest/actions/secrets#get-an-environment-public-key
 */
export const getAnEnvironmentPublicKey = async (
  options: {
    environment_name: string,
    repository_id: number,
  } & Partial<Parameters<ActionsApi['getEnvironmentPublicKey']>[0]>
): Promise<ActionsPublicKey> => {
  const response = await getOctokitApi().rest.actions.getEnvironmentPublicKey({
    ...options
  });
  return response.data as ActionsPublicKey;
};

/**
 * https://docs.github.com/en/rest/actions/secrets#get-an-environment-secret
 */
export const getAnEnvironmentSecret = async (
  options: {
    repository_id: number,
    environment_name: string,
    secret_name: string,
  } & Partial<Parameters<ActionsApi['getEnvironmentSecret']>[0]>
): Promise<ActionsSecret> => {
  const response = await getOctokitApi().rest.actions.getEnvironmentSecret({
    ...options
  });
  return response.data as ActionsSecret;
};

/**
 * https://docs.github.com/en/rest/actions/secrets#list-environment-secrets
 */
export const listEnvironmentSecrets = async (
  options: {
    repository_id: number,
    environment_name: string,
  } & Partial<Parameters<ActionsApi['getEnvironmentSecret']>[0]>
): Promise<ActionsSecret[]> => {
  const response = await getOctokitApi().rest.actions.listEnvironmentSecrets({
    ...options
  });
  return response.data.secrets as ActionsSecret[];
};
