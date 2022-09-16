import {repoName} from '../../../unity/app-spec.js';
import {createOrUpdateFileContents, getRepositoryContent, listOrganizationRepositories} from './repositories.js';
import {base64} from '../../../strings/encoding.js';

export const isRepoExistent = async (appName: string | null | undefined): Promise<boolean> => {
  const newAppRepoName = repoName(appName);

  const repositories = await listOrganizationRepositories();
  return repositories.map(r => r.name).includes(newAppRepoName);
};

export const addFile = async (repo: string, path: string, content: string, branch = 'main') => {
  return await createOrUpdateFileContents({
    repo,
    path,
    branch,
    content: base64(content),
    message: `add ${path.split('/').pop()}`,
  });
};

export const updateFile = async (repo: string, path: string, content: string, branch = 'main') => {
  const existingContent = await getRepositoryContent({
    repo,
    path,
    branch,
  });
  let sha: string | undefined = undefined;
  if ('sha' in existingContent) {
    sha = existingContent.sha;
  }
  return await createOrUpdateFileContents({
    repo,
    path,
    branch,
    sha,
    content: base64(content),
    message: `update ${path.split('/').pop()}`,
  });
};
