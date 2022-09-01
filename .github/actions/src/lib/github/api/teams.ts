import * as github from '@actions/github';
import * as core from '@actions/core';
import {FullTeam} from '../response/full-team.js';
import {SimpleUser} from '../response/simple-user.js';
import {getGithubToken, RestApi} from './rest.js';

type TeamsApi = RestApi['teams'];

/**
 * see https://docs.github.com/en/rest/teams/teams#get-a-team-by-name
 */
export const getTeamByName = async (
  options: { team_slug: string } & Partial<Parameters<TeamsApi['getByName']>[0]>
): Promise<FullTeam> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.teams.getByName({
    org: github.context.repo.owner,
    ...options
  });
  const fullTeam = response.data as FullTeam;
  core.debug(`${JSON.stringify(fullTeam, null, 2)}`);
  return fullTeam;
};

/**
 * see https://docs.github.com/en/rest/teams/members#list-team-members
 */
export const listMembersInOrg = async (
  options: { team_slug: string } & Partial<Parameters<TeamsApi['listMembersInOrg']>[0]>
): Promise<SimpleUser[]> => {
  const octokit = github.getOctokit(getGithubToken());
  const response = await octokit.rest.teams.listMembersInOrg({
    org: github.context.repo.owner,
    ...options
  });
  const simpleUsers = response.data as SimpleUser[];
  core.debug(`${JSON.stringify(simpleUsers, null, 2)}`);
  return simpleUsers;
};
