import {repoName} from '../../../unity/app-spec.js';
import {listOrganizationRepositories} from './repositories.js';

export const isRepoExistent = async (appName: string | null | undefined): Promise<boolean> => {
  const newAppRepoName = repoName(appName);

  const repositories = await listOrganizationRepositories();
  return repositories.map(r => r.name).includes(newAppRepoName);
};
