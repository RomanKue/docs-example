import {RestApi} from '../rest.js';
import * as github from '@actions/github';
import {getOctokitApi} from '../../octokit.js';
import {ActionsPublicKey} from './response/actions-public-key.js';

type ActionsApi = RestApi['actions'];

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
