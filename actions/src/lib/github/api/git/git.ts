import {getOctokitApi} from '../../octokit.js';
import * as github from '@actions/github';
import {RestApi} from '../rest.js';
import {GitReference} from './response/git-reference.js';

type GitApi = RestApi['git'];

/**
 * see https://docs.github.com/en/rest/git/refs#create-a-reference
 */
export const createAReference = async (
  options: { ref: string, sha: string } & Partial<Parameters<GitApi['createRef']>[0]>
): Promise<GitReference> => {
  const response = await getOctokitApi().rest.git.createRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as GitReference;
};
