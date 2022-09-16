import * as github from '@actions/github';
import {RestApi} from '../rest.js';
import {getOctokitApi} from '../../octokit.js';
import {SimpleUser} from '../teams/response/simple-user.js';

type OrgsApi = RestApi['orgs'];


/**
 * see https://docs.github.com/en/rest/orgs/members#list-organization-members
 */
export const listOrganizationMembers = async (
  options: Partial<Parameters<OrgsApi['listMembers']>[0]> = {page: 100}
): Promise<SimpleUser[]> => {
  const response = await getOctokitApi().rest.orgs.listMembers({
    org: github.context.repo.owner,
    ...options
  });
  return response.data as SimpleUser[];
};
