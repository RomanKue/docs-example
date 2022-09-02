import * as github from '@actions/github';
import {FullTeam} from './response/full-team.js';
import {SimpleUser} from './response/simple-user.js';
import {RestApi} from '../rest.js';
import {getOctokit} from '../../octokit.js';

type TeamsApi = RestApi['teams'];

/**
 * see https://docs.github.com/en/rest/teams/teams#get-a-team-by-name
 */
export const getTeamByName = async (
  options: { team_slug: string } & Partial<Parameters<TeamsApi['getByName']>[0]>
): Promise<FullTeam> => {
  const response = await getOctokit().rest.teams.getByName({
    org: github.context.repo.owner,
    ...options
  });
  return response.data as FullTeam;
};

/**
 * see https://docs.github.com/en/rest/teams/members#list-team-members
 */
export const listMembersInOrg = async (
  options: { team_slug: string } & Partial<Parameters<TeamsApi['listMembersInOrg']>[0]>
): Promise<SimpleUser[]> => {
  const response = await getOctokit().rest.teams.listMembersInOrg({
    org: github.context.repo.owner,
    ...options
  });
  return response.data as SimpleUser[];
};
