import {repoName} from '../../../unity/app-spec.js';
import {createOrUpdateFileContents, listOrganizationRepositories} from './repositories.js';
import {base64} from '../../../strings/encoding.js';

export const isRepoExistent = async (appName: string | null | undefined): Promise<boolean> => {
  const newAppRepoName = repoName(appName);

  const repositories = await listOrganizationRepositories();
  return repositories.map(r => r.name).includes(newAppRepoName);
};

export const addFile = async (repo: string, path: string, content: string) => {
  return await createOrUpdateFileContents({
    repo,
    path,
    content: base64(content),
    message: `add ${path.split('/').pop()}`
  });
};
