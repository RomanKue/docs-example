import {getOctokitApi} from '../../octokit.js';
import {PullRequest} from './response/pull-request.js';
import * as github from '@actions/github';
import {RestApi} from '../rest.js';

export type PullsApi = RestApi['pulls'];

/**
 * https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#create-a-pull-request
 */
export const createAPullRequest = async (
  options: {title: string, head: string, base: string } & Partial<Parameters<PullsApi['create']>[0]>
): Promise<PullRequest> => {
  const response = await getOctokitApi().rest.pulls.create({owner: github.context.repo.owner, repo: github.context.repo.repo,
    ...options});
  return response.data as PullRequest;
};
