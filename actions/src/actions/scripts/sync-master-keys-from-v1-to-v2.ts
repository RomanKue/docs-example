import {getInput, SyncMasterKeysInputs} from '../../lib/github/input.js';
import {allEnvironments, k8sSecretConstants} from '../../lib/unity/config.js';
import {searchRepositories} from '../../lib/github/api/search/search.js';
import * as core from '@actions/core';
import {createK8sObjects, getKubeConfig, readSecret, readSecretForEnvironment} from '../../lib/unity/app-repo/k8s.js';

/**
 *  Set the master key (CRYPT_MASTER_KEY) of every app matching the regex and selected namespace if it doesn't exist.
 *  If overwrite is true, update the existing ones too.
 */
export const syncMasterKeysFromV1ToV2 = async () => {
  const appRegex = getInput<SyncMasterKeysInputs>('repository-regex');
  const env = Object.values(allEnvironments).find(v => v === getInput<SyncMasterKeysInputs>('environment'));
  const repositories = (await searchRepositories({q: 'topic:unity-app org:UNITY fork:true archived:false'}))
    .filter(repo => repo.name.match(appRegex));
  core.info(`${repositories.length} repos were found matching the search and regex criteria`);
  core.info(`updating secrets for env: ${env}`);
  if (env && repositories?.length > 0) {
    const overwrite = getInput<SyncMasterKeysInputs>('overwrite') == 'true';
    const kc = getKubeConfig(env,
      getInput<SyncMasterKeysInputs>('KUBERNETES_HOST'),
      getInput<SyncMasterKeysInputs>('KUBERNETES_NAMESPACE'),
      getInput<SyncMasterKeysInputs>('KUBERNETES_TOKEN'));
    for (const repo of repositories) {
      core.info(`Syncing crypt master key for repo ${repo.name} with overwrite: ${overwrite}`);
      const isV1MasterKeyExistent = !!await readSecret(kc, `${repo.name}${k8sSecretConstants.masterKeyV1Suffix}`);
      const isV2MasterKeyExistent = !!await readSecret(kc, `${repo.name}${k8sSecretConstants.masterKeyV2Suffix}`);
      if (!isV1MasterKeyExistent){
        core.warning(`Master key v1 for repo ${repo.name} was not found, skipping update`);
        continue;
      }
      if (overwrite || !isV2MasterKeyExistent) {
        const masterKeyV1 = await readSecretForEnvironment(kc, `${repo.name}${k8sSecretConstants.masterKeyV1Suffix}`, k8sSecretConstants.masterKey);
        // role binding needs to be updated as well.
        await createK8sObjects(env, repo.name, kc, masterKeyV1);
        core.info(`Master key v2 for repo ${repo.name} was updated`);
      } else {
        core.info(`Master key v2 for repo ${repo.name} is already set and overwrite is false. Did nothing`);
      }
    }
  }
};
