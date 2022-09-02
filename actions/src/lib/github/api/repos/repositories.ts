import * as github from '@actions/github';
import {FullTeam} from '../teams/response/full-team.js';
import {SimpleUser} from '../teams/response/simple-user.js';
import {RestApi} from '../rest.js';
import {getOctokit} from '../../octokit.js';
import {Repository} from './response/repository.js';
import {FullRepository} from './response/full-repository.js';
import {MinimalRepository} from './response/minimal-repository.js';

type ReposApi = RestApi['repos'];

/**
 * see https://docs.github.com/en/rest/repos/repos#get-a-repository
 */
export const getARepository = async (
  options: { repo: string } & Partial<Parameters<ReposApi['get']>[0]>
): Promise<FullRepository> => {
  const response = await getOctokit().rest.repos.get({
    owner: github.context.repo.owner,
    ...options
  });
  return response.data as FullRepository;
};

/**
 * see https://docs.github.com/en/rest/repos/repos#list-organization-repositories
 */
export const listOrganizationRepositories = async (
  options: Partial<Parameters<ReposApi['get']>[0]> = {}
): Promise<MinimalRepository[]> => {
  const response = await getOctokit().rest.repos.listForOrg({
    org: github.context.repo.owner,
    ...options
  });
  return response.data as MinimalRepository[];
};

/**
 * see https://docs.github.com/en/rest/repos/repos#create-an-organization-repository
 */
export const createAnOrganizationRepository = async (
  options: { name: string } & Partial<Parameters<ReposApi['createInOrg']>[0]>
): Promise<Repository> => {
  const response = await getOctokit().rest.repos.createInOrg({
    org: github.context.repo.owner,
    ...options
  });
  return response.data as Repository;
};

