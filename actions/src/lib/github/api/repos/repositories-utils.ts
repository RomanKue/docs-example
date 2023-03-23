import {repoName} from '../../../unity/app-spec.js';
import {
  createOrUpdateFileContents,
  deleteAFile,
  getRepositoryContent,
  listOrganizationRepositories,
  ReposApi
} from './repositories.js';
import {base64} from '../../../strings/encoding.js';
import {ReadonlyDeep} from 'type-fest';
import {Repository} from './response/repository.js';
import {createOrUpdateAnEnvironmentSecret, getAnEnvironmentPublicKey} from '../actions/actions.js';

import sodium from 'tweetsodium';
import {RequestError} from '@octokit/request-error';
import {repositoriesUtils} from './index.js';

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

export const upsertFile = async (repo: string, path: string, content: string, branch = 'main') => {
  if (await repositoriesUtils.isContentExistent({repo,
    path,
    ref: branch})) {
    return await repositoriesUtils.updateFile(
      repo,
      path,
      content,
      branch);
  } else {
    return await repositoriesUtils.addFile(
      repo,
      path,
      content,
      branch);
  }
};

export const deleteFile = async (repo: string, path: string, branch = 'main') => {
  const existingContent = await getRepositoryContent({
    repo,
    path,
    branch,
  });
  let sha = '';
  if ('sha' in existingContent) {
    sha = existingContent.sha;
  }
  return await deleteAFile({repo, path, message: `Remove ${path}`, sha});
};

/**
 * enrypt the secret value using libsodium
 * @param message secret message to encrypt
 * @param key the base 64 public key to use for encryption
 */
export const encrypt = (message: string, key: string) => {
  const messageBytes = Buffer.from(message);
  const keyBytes = Buffer.from(key, 'base64');
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);
  return Buffer.from(encryptedBytes).toString('base64');
};

export const createEnvironmentSecret = async (
  repository: ReadonlyDeep<Pick<Repository, 'id'>>,
  environment: string,
  name: string,
  value: string) => {

  const publicKey = await getAnEnvironmentPublicKey({
    repository_id: repository.id,
    environment_name: environment,
  });

  const encrypted = encrypt(value, publicKey.key);

  await createOrUpdateAnEnvironmentSecret({
    repository_id: repository.id,
    environment_name: environment,
    secret_name: name,
    key_id: publicKey.key_id,
    encrypted_value: encrypted,
  });
};


export const isContentExistent = async (
  options: {
    path: string,
  } & Partial<Parameters<ReposApi['getContent']>[0]>
) => {
  try {
    await getRepositoryContent(options);
    return true;
  } catch (e) {
    if (e instanceof RequestError && e.status === 404) {
      return false;
    }
    throw e;
  }
};
