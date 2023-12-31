import {getInput, RecreateAppServiceAccountInputs} from '../../lib/github/input.js';
import {allEnvironments, githubSecretKeys} from '../../lib/unity/config.js';
import {listOrganizationRepositories} from '../../lib/github/api/repos/repositories.js';
import {createK8sObjects, getKubeConfig} from '../../lib/unity/app-repo/k8s.js';
import {repositoriesUtils} from '../../lib/github/api/repos/index.js';

/**
 * Recreate the service account for the selected namespace and apps matching the `repository-regex` and update
 * the service account token of the selected apps in GHE.
 */
export const recreateAppServiceAccount = async () => {
  const appRegex = getInput<RecreateAppServiceAccountInputs>('repository-regex');
  const env = Object.values(allEnvironments).find(v => v === getInput<RecreateAppServiceAccountInputs>('environment'));
  const repositories = (await listOrganizationRepositories()).filter(repo => repo.name.match(appRegex));
  if (env && repositories) {
    const kc = getKubeConfig(env,
      getInput<RecreateAppServiceAccountInputs>('KUBERNETES_HOST'),
      getInput<RecreateAppServiceAccountInputs>('KUBERNETES_NAMESPACE'),
      getInput<RecreateAppServiceAccountInputs>('KUBERNETES_TOKEN'));
    for (const repo of repositories) {
      const serviceAccountToken = await createK8sObjects(env, repo.name, kc, undefined);
      await repositoriesUtils.createEnvironmentSecret({id: repo.id}, env, githubSecretKeys.kubernetesToken, serviceAccountToken);
    }
  }
};
