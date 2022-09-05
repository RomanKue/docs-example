import * as github from '@actions/github';
import {FullTeam} from '../teams/response/full-team.js';
import {SimpleUser} from '../teams/response/simple-user.js';
import {RestApi} from '../rest.js';
import {getOctokitApi} from '../../octokit.js';
import {Repository} from './response/repository.js';
import {FullRepository} from './response/full-repository.js';
import {MinimalRepository} from './response/minimal-repository.js';
import {RepositoryInvitation} from './response/repository-invitation.js';
import {FileCommit} from './response/file-commit.js';
import {Topic} from './response/topic.js';

type ReposApi = RestApi['repos'];

/**
 * see https://docs.github.com/en/rest/repos/repos#get-a-repository
 */
export const getARepository = async (
  options: { repo: string } & Partial<Parameters<ReposApi['get']>[0]>
): Promise<FullRepository> => {
  const response = await getOctokitApi().rest.repos.get({
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
  const response = await getOctokitApi().rest.repos.listForOrg({
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
  const response = await getOctokitApi().rest.repos.createInOrg({
    org: github.context.repo.owner,
    ...options
  });
  return response.data as Repository;
};

/**
 * see https://docs.github.com/en/rest/repos/repos#replace-all-repository-topics
 */
export const replaceAllRepositoryTopics = async (
  options: { names: string[] } & Partial<Parameters<ReposApi['replaceAllTopics']>[0]>
): Promise<Topic> => {
  const response = await getOctokitApi().rest.repos.replaceAllTopics({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as Topic;
};

/**
 * see https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator
 */
export const addARepositoryCollaborator = async (
  options: { username: string } & Partial<Parameters<ReposApi['addCollaborator']>[0]>
): Promise<RepositoryInvitation> => {
  const response = await getOctokitApi().rest.repos.addCollaborator({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as RepositoryInvitation;
};


/**
 * see https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
 */
export const createOrUpdateFileContents = async (
  options: { path: string, message: string, content: string } & Partial<Parameters<ReposApi['createOrUpdateFileContents']>[0]>
): Promise<FileCommit> => {
  const response = await getOctokitApi().rest.repos.createOrUpdateFileContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as FileCommit;
};

