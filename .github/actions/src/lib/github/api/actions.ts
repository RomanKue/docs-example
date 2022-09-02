import {RestApi} from './rest.js';
import * as github from '@actions/github';
import {getOctokit} from '../octokit.js';

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
  const response = await getOctokit().rest.actions.createWorkflowDispatch({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ...options
    }
  );
};
