import { unityTeams } from '../config.js';
import { listMembersInOrg } from '../../github/api/teams/teams.js';

export const getApprovers = async () => {
  const unityAppApproversTeam = await listMembersInOrg({team_slug: unityTeams.unityAppApproversSlug});
  return unityAppApproversTeam.map(user => user.login);
};
