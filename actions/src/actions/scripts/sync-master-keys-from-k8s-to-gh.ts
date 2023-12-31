import {getInput, SyncMasterKeysInputs} from '../../lib/github/input.js';
import {allEnvironments, githubSecretKeys, k8sSecretConstants} from '../../lib/unity/config.js';
import {searchRepositories} from '../../lib/github/api/search/search.js';
import * as core from '@actions/core';
import {getKubeConfig, readSecretForEnvironment} from '../../lib/unity/app-repo/k8s.js';
import {isSecretExistent} from '../../lib/github/api/actions/actions-utils.js';
import {repositoriesUtils} from '../../lib/github/api/repos/index.js';

/**
 *  Set the master key (CRYPT_MASTER_KEY) of every app matching the regex and selected namespace if it doesn't exist.
 *  If overwrite is true, update the existing ones too.
 */
export const syncMasterKeysFromK8sToGh = async () => {
  const appRegex = getInput<SyncMasterKeysInputs>('repository-regex');
  const env = Object.values(allEnvironments).find(v => v === getInput<SyncMasterKeysInputs>('environment'));
  const repositories = (await searchRepositories({q: 'topic:unity-app org:UNITY fork:true'}))
    .filter(repo => repo.name.match(appRegex));
  core.info(`${repositories.length} repos were found matching the search and regex criteria`);
  if (env && repositories?.length > 0) {
    const overwrite = getInput<SyncMasterKeysInputs>('overwrite') == 'true';
    const masterKeySecretSuffix = getInput<SyncMasterKeysInputs>('master-key-secret-suffix');
    const kc = getKubeConfig(env,
      getInput<SyncMasterKeysInputs>('KUBERNETES_HOST'),
      getInput<SyncMasterKeysInputs>('KUBERNETES_NAMESPACE'),
      getInput<SyncMasterKeysInputs>('KUBERNETES_TOKEN'));
    for (const repo of repositories) {
      core.info(`Syncing crypt master key for repo ${repo.name} with overwrite: ${overwrite} and master-key-secret-suffix: ${masterKeySecretSuffix}`);
      const isMasterKeyExistent = await isSecretExistent({
        repository_id: repo.id,
        environment_name: env,
        secret_name: githubSecretKeys.cryptMasterKey
      });
      if (overwrite || !isMasterKeyExistent) {
        const k8sAppMasterKey = await readSecretForEnvironment(kc, `${repo.name}${masterKeySecretSuffix}`, k8sSecretConstants.masterKey);
        await repositoriesUtils.createEnvironmentSecret({id: repo.id}, env, githubSecretKeys.cryptMasterKey, k8sAppMasterKey);
        core.info(`Master key for repo ${repo.name} was updated`);
      } else {
        core.info(`Master key for repo ${repo.name} is already set and overwrite is false. Did nothing`);
      }
    }
  }
};
