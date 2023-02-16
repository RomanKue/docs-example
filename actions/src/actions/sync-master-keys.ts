import {run} from '../lib/run.js';
import {getInput, SyncMasterKeysInputs} from '../lib/github/input.js';
import {environments, githubSecretKeys, k8sSecretKeys} from '../lib/unity/config.js';
import {repositoriesUtils} from '../lib/github/api/repos/index.js';
import {searchRepositories} from '../lib/github/api/search/search.js';
import {getKubeConfig, readSecretForEnvironment} from '../lib/unity/app-repo/k8s.js';
import * as core from '@actions/core';
import {isSecretExistent} from '../lib/github/api/actions/actions-utils.js';

/**
 *  Set the master key (CRYPT_MASTER_KEY) of every app matching the regex and selected namespace if it doesn't exist.
 *  If overwrite is true, update the existing ones too.
 */
export const syncMasterKeys = async () => {
  const appRegex = getInput<SyncMasterKeysInputs>('repository-regex');
  const env = Object.values(environments).find(v => v === getInput<SyncMasterKeysInputs>('environment'));
  const repositories = (await searchRepositories({q: 'topic:unity-app org:UNITY fork:true'}))
    .filter(repo => repo.name.match(appRegex));
  if (env && repositories?.length > 0) {
    const overwrite = getInput<SyncMasterKeysInputs>('overwrite') == 'true';
    const kc = getKubeConfig(env,
      getInput<SyncMasterKeysInputs>('KUBERNETES_HOST'),
      getInput<SyncMasterKeysInputs>('KUBERNETES_NAMESPACE'),
      getInput<SyncMasterKeysInputs>('KUBERNETES_TOKEN'));
    const k8sMasterKey = await readSecretForEnvironment(kc, k8sSecretKeys.cryptMasterKey);
    await repositories.forEach(async (repo) => {
      core.debug(`Syncing crypt master key for repo ${repo.name} with overwrite: ${overwrite}`);
      const currentMasterKey = await isSecretExistent({
        repository_id: repo.id,
        environment_name: env,
        secret_name: githubSecretKeys.cryptMasterKey
      });
      if (overwrite || !currentMasterKey) {
        await repositoriesUtils.createEnvironmentSecret({id: repo.id}, env, githubSecretKeys.cryptMasterKey, k8sMasterKey);
        core.debug(`Master key for repo ${repo.name} was updated`);
      } else {
        core.debug(`Master key for repo ${repo.name} is already set and overwrite is false. Did nothing`);
      }
    });
  }
};

run(syncMasterKeys);
