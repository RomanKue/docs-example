import * as github from '@actions/github';
import {RestApi} from '../rest.js';
import {getOctokitApi} from '../../octokit.js';
import {Repository} from './response/repository.js';
import {FullRepository} from './response/full-repository.js';
import {MinimalRepository} from './response/minimal-repository.js';
import {RepositoryInvitation} from './response/repository-invitation.js';
import {FileCommit} from './response/file-commit.js';
import {Topic} from './response/topic.js';
import {Content} from './response/content.js';
import {Environment} from './response/environment.js';
import {ProtectedBranch} from './response/protected-branch.js';

export type ReposApi = RestApi['repos'];

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
  let repos: MinimalRepository[] = [];
  let pagesRemaining = false;
  let page = 1;
  do {
    const response = await getOctokitApi().rest.repos.listForOrg({
      org: github.context.repo.owner,
      page,
      ...options
    });
    page++;
    const linkHeader = response.headers.link;
    pagesRemaining = !!(linkHeader && linkHeader.includes(`rel="next"`));
    repos = [...repos, ...response.data as MinimalRepository[]];
  } while (pagesRemaining);
  return repos;
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
  options: {
    path: string,
    message: string,
    content: string,
  } & Partial<Parameters<ReposApi['createOrUpdateFileContents']>[0]>
): Promise<FileCommit> => {
  const response = await getOctokitApi().rest.repos.createOrUpdateFileContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as FileCommit;
};

/**
 * https://docs.github.com/en/rest/repos/contents#get-repository-content
 */
export const getRepositoryContent = async (
  options: {
    path: string,
  } & Partial<Parameters<ReposApi['getContent']>[0]>
): Promise<Content> => {
  const response = await getOctokitApi().rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as Content;
};

/**
 * https://docs.github.com/en/rest/deployments/environments#create-or-update-an-environment
 */
export const createOrUpdateAnEnvironment = async (
  options: {
    environment_name: string,
  } & Partial<Parameters<ReposApi['createOrUpdateEnvironment']>[0]>
): Promise<Environment> => {
  const response = await getOctokitApi().rest.repos.createOrUpdateEnvironment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as Environment;
};

interface UserTeamsApps {
  users: string[],
  teams: string[],
  apps?: string[]
}

interface RequiredPullRequestReviews {
  dismissal_restrictions: UserTeamsApps,
  dismiss_stale_reviews: boolean,
  require_code_owner_reviews: boolean,
  required_approving_review_count: number,
  require_last_push_approval: boolean,
  bypass_pull_request_allowances: UserTeamsApps
}

interface RequiredStatusChecks {
  strict: boolean,
  /**
   * @deprecated
   */
  contexts?: string[] | undefined,
  checks: { context: string, app_id?: number }[]
}

/**
 * https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection
 */
export const updateBranchProtection = async (
  options: {
    branch: string,
    required_status_checks: RequiredStatusChecks | null,
    enforce_admins: boolean | null,
    required_pull_request_reviews: RequiredPullRequestReviews | null,
    restrictions: UserTeamsApps | null,
  } & Partial<Parameters<ReposApi['updateBranchProtection']>[0]>
): Promise<ProtectedBranch> => {
  const response = await getOctokitApi().rest.repos.updateBranchProtection({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ...options
  });
  return response.data as ProtectedBranch;
};
