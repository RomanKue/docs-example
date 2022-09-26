import {AppSpec, imageName, isV1Beta1, repoName} from '../app-spec.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {defaultTopics, environments, makeStubWorkflowId, secretKeys, unityRepositoryRoles} from '../config.js';
import {createGitignore} from './gitignore.js';
import {createReadme} from './readme.js';
import {repositoriesUtils} from '../../github/api/repos/index.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  createOrUpdateAnEnvironment,
  replaceAllRepositoryTopics
} from '../../github/api/repos/repositories.js';
import {Repository} from '../../github/api/repos/response/repository.js';
import {createDeployWorkflow, deployAppWorkflowFileName} from './workflows/deploy-workflow.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {produce} from 'immer';
import orgs from '../../github/api/orgs/index.js';
import actions from '../../github/api/actions/index.js';
import {Issue} from '../../github/api/issues/response/issue.js';
import {ReadonlyDeep} from 'type-fest';
import {SimpleUser} from '../../github/api/teams/response/simple-user.js';
import {getInput} from '../../github/input.js';
import {createK8sObjects} from './k8s.js';
import {assertUnreachable} from '../../run.js';

export const appYamlPath = (env: 'int' | 'prod') => `unity-app.${env}.yaml`;

const updateAppDeployments = async (appSpec: ReadonlyDeep<AppSpec>, name: string) => {
  if (isV1Beta1(appSpec)) {
    appSpec = produce(appSpec, draft => {
      const deployments = draft.deployments ?? {};
      deployments[name] = {
        container: {
          image: imageName(appSpec.name, name),
          tag: 'latest',
        },
        replicas: 2,
      };
      draft.deployments = deployments;
    });
    await repositoriesUtils.updateFile(repoName(appSpec.name), appYamlPath(environments.int), yaml.dump(appSpec));
    await repositoriesUtils.updateFile(repoName(appSpec.name), appYamlPath(environments.prod), yaml.dump(appSpec));
  }
  return appSpec;
};


export const removeOrgMembers = async (appMembers: ReadonlyDeep<SimpleUser[]>) => {
  const orgMembers = (await orgs.listOrganizationMembers()).map(u => u.login);
  if (orgMembers.length >= 100) {
    throw new Error(`need to implement pagination, as there are more org members than can be fetched in one request: ${orgMembers.length}`);
  }
  return appMembers.filter(m => !orgMembers.includes(m.login));
};

export const createRepository = async (
  issue: ReadonlyDeep<Issue>,
  newAppIssue: ReadonlyDeep<NewAppIssue>,
  appSpec: ReadonlyDeep<AppSpec>
): Promise<{ appSpec: ReadonlyDeep<AppSpec>; appRepository: ReadonlyDeep<Repository> }> => {
  const newAppRepoName = repoName(appSpec.name);
  if (await repositoriesUtils.isRepoExistent(appSpec.name)) {
    throw new Error(`the repository ${newAppRepoName} already exists`);
  }

  const appRepository = await createAnOrganizationRepository({
    name: newAppRepoName,
    visibility: 'private',
  });

  const topic = await replaceAllRepositoryTopics({
    repo: appRepository.name,
    names: [...Object.values(defaultTopics)],
  });

  let commit: FileCommit;
  commit = await repositoriesUtils.addFile(appRepository.name, '.gitignore', createGitignore());
  commit = await repositoriesUtils.addFile(appRepository.name, 'README.md', createReadme(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(environments.int), yaml.dump(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(environments.prod), yaml.dump(appSpec));

  if (newAppIssue.generateAngularStub) {
    const name = 'ui';
    appSpec = await updateAppDeployments(appSpec, name);
    await actions.createAWorkflowDispatchEvent({
      ref: 'main',
      workflow_id: makeStubWorkflowId,
      inputs: {
        name,
        repository: appRepository.name,
        type: 'angular',
      }
    });
  }

  if (newAppIssue.generateQuarkusStub) {
    const name = 'api';
    appSpec = await updateAppDeployments(appSpec, name);
    await actions.createAWorkflowDispatchEvent({
      ref: 'main',
      workflow_id: makeStubWorkflowId,
      inputs: {
        name,
        repository: appRepository.name,
        type: 'quarkus',
      }
    });
  }

  commit = await repositoriesUtils.addFile(appRepository.name, `.github/workflows/${deployAppWorkflowFileName}`, createDeployWorkflow());

  for (const env of Object.values(environments)) {
    await createOrUpdateAnEnvironment({
      repo: appRepository.name,
      environment_name: env
    });

    const token = await createK8sObjects(env, appRepository.name);
    await repositoriesUtils.createEnvironmentSecret(appRepository, env, secretKeys.kubernetesToken, token);

    switch (env) {
    case 'int':
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, secretKeys.kubernetesHost, getInput('INT_KUBERNETES_HOST'));
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, secretKeys.kubernetesNamespace, getInput('INT_KUBERNETES_NAMESPACE'));
      break;
    case 'prod':
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, secretKeys.kubernetesHost, getInput('PROD_KUBERNETES_HOST'));
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, secretKeys.kubernetesNamespace, getInput('PROD_KUBERNETES_NAMESPACE'));
      break;
    default:
      assertUnreachable(env);
    }
  }

  let appMembers = issue.user ? [issue.user] : [];
  appMembers = await removeOrgMembers(appMembers);
  for (const member of appMembers) {
    await addARepositoryCollaborator({
      repo: appRepository.name,
      username: member.login,
      permission: unityRepositoryRoles as never,
    });
  }

  return {appSpec, appRepository};
};
