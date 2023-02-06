import {run} from '../lib/run.js';
import {readServiceAccountToken} from '../lib/unity/app-repo/k8s.js';
import {repositoriesUtils} from '../lib/github/api/repos/index.js';
import {secretKeys} from '../lib/unity/config.js';
import {listOrganizationRepositories} from '../lib/github/api/repos/repositories.js';
import {getInput} from '../lib/github/input.js';

run(async () => {
   const appRepos = ['app-rrps', 'app-foo',
     'app-blacklist-pendelschlag', 'app-fgp', 'app-rocketeers-app', 'app-wktbot-app'];
  const repositories = await listOrganizationRepositories();
  await appRepos.forEach(async (repoName) => {
    const serviceAccountToken = await readServiceAccountToken('prod', repoName);
    const repository = repositories.find(repo => repo.name === repoName);
    if (repository && serviceAccountToken) {
      await repositoriesUtils.createEnvironmentSecret({id: repository.id }, 'prod', secretKeys.kubernetesToken, serviceAccountToken);
      await repositoriesUtils.createEnvironmentSecret({id: repository.id }, 'prod', secretKeys.kubernetesHost, getInput('PROD_KUBERNETES_HOST'));
      await repositoriesUtils.createEnvironmentSecret({id: repository.id }, 'prod', secretKeys.kubernetesNamespace, getInput('PROD_KUBERNETES_NAMESPACE'));
    }
  });
});
