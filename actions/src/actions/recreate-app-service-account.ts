import {run} from '../lib/run.js';
import {createK8sObjects} from '../lib/unity/app-repo/k8s.js';
import {listOrganizationRepositories} from "../lib/github/api/repos/repositories.js";
import {getInput} from "../lib/github/input.js";
import {environments, secretKeys} from "../lib/unity/config.js";
import {repositoriesUtils} from "../lib/github/api/repos/index.js";

/**
 * Recreate the service account for the selected namespace and apps matching the `repository-regex` and update
 * the service account token of the selected apps in GHE.
 */
run(async () => {
  const appRegex = getInput("repository-regex");
  const env = Object.values(environments).find(v => v === getInput("environment"));
  const repositories = (await listOrganizationRepositories()).filter(repo => repo.name.match(appRegex));
  if (env && repositories) {
    await repositories.forEach(async (repo) => {
      const serviceAccountToken = await createK8sObjects(env, repo.name);
      await repositoriesUtils.createEnvironmentSecret({id: repo.id}, env, secretKeys.kubernetesToken, serviceAccountToken);
    });
  }
});
