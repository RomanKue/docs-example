import {AppDeployment, AppSpec, imageName, isV1Beta1, repoName} from '../app-spec.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {
  angularStubName,
  defaultTopics,
  environments,
  makeStubWorkflowId,
  quarkusStubName,
  secretKeys,
  unityRepositoryRoles
} from '../config.js';
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
import {addSimpleComment} from '../../github/api/issues/issues-utils.js';
import {isContentExistent} from '../../github/api/repos/repositories-utils.js';
import * as core from '@actions/core';

export const appYamlPath = (env: 'int' | 'prod') => `unity-app.${env}.yaml`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const updateAppDeployments = async (
  appSpec: ReadonlyDeep<AppSpec>,
  name: string, container: AppDeployment['container']
) => {
  if (isV1Beta1(appSpec)) {
    appSpec = produce(appSpec, draft => {
      const deployments = draft.deployments ?? {};
      deployments[name] = {
        container,
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

  await addSimpleComment(issue, user =>
    `🏗 ${user} be patient while creating your repository, it should be ready soon.`
  );

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
  commit = await repositoriesUtils.addFile(appRepository.name, 'README.md', createReadme(newAppIssue));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(environments.int), yaml.dump(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(environments.prod), yaml.dump(appSpec));

  if (newAppIssue.generateAngularStub) {
    const name = angularStubName;
    appSpec = await updateAppDeployments(appSpec, name,
      {
        image: imageName(appSpec.name, name),
        tag: 'latest',
        tmpDirs: ['/tmp']
      },
    );
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
    const name = quarkusStubName;
    appSpec = await updateAppDeployments(appSpec, name,
      {
        image: imageName(appSpec.name, name),
        tag: 'latest',
        tmpDirs: ['/tmp'],
        capabilities: ['DAC_OVERRIDE']
      },);
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
    core.debug(`creating environment "${env}"`);
    await createOrUpdateAnEnvironment({
      repo: appRepository.name,
      environment_name: env
    });

    core.debug(`generating token "${env}"`);
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

  // wait for delivery of app stubs
  if (newAppIssue.generateAngularStub) {
    core.debug(`waiting for angular stub to be generated`);
    for (; ;) {
      const contentExists = await isContentExistent({
        repo: appRepository.name,
        path: angularStubName,
        ref: 'main'
      });
      if (contentExists) {
        core.debug(`angular content exists`);
        break;
      }
      core.debug(`waiting...`);
      await sleep(1_000);
    }
  }
  if (newAppIssue.generateQuarkusStub) {
    core.debug(`waiting for quarkus stub to be generated`);
    for (; ;) {
      const contentExists = await isContentExistent({
        repo: appRepository.name,
        path: quarkusStubName,
        ref: 'main'
      });
      if (contentExists) {
        core.debug(`quarkus content exists`);
        break;
      }
      core.debug(`waiting...`);
      await sleep(1_000);
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
