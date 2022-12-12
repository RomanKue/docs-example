import {AppDeployment, AppSpec, imageName, isV1, isV1Beta1, repoName} from '../app-spec.js';
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
import {configChangeWorkflowFileName, createConfigChangeWorkflow} from './workflows/config-change-workflow.js';
import {
  createAngularModule,
  createEncodings,
  createJsonSchemas,
  createMisc,
  createModules,
  createNpmInstallRunConfig,
  createNpmStartRunConfig,
  createQuarkusDevRunConfig,
  createQuarkusModule,
  createRootModule,
  createVcs
} from './idea.js';
import {createDependabot} from './dependabot.js';
import {storeSecretsWorkflowFileName, createStoreSecretsWorkflow} from './workflows/store-secrets-workflow.js';

export const appYamlPath = (env: 'int' | 'prod') => `unity-app.${env}.yaml`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const updateAppDeployments = async (
  appSpec: ReadonlyDeep<AppSpec>,
  name: string,
  deployment: AppDeployment,
  redirect?: string,
) => {
  if (isV1Beta1(appSpec) || isV1(appSpec)) {
    appSpec = produce(appSpec, draft => {
      if (redirect) {
        draft.redirect = redirect;
      }
      const deployments = draft.deployments ?? {};
      deployments[name] = {
        replicas: 2,
        ...deployment,
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
  const javaVersion = 17;
  const newAppRepoName = repoName(appSpec.name);
  if (await repositoriesUtils.isRepoExistent(appSpec.name)) {
    throw new Error(`the repository ${newAppRepoName} already exists`);
  }

  await addSimpleComment(issue, user =>
    `🏗 @${user} be patient while creating your repository, it should be ready soon.`
  );

  const appRepository = await createAnOrganizationRepository({
    name: newAppRepoName,
    visibility: 'private',
    allow_auto_merge: true,
    delete_branch_on_merge: true
  });

  const topic = await replaceAllRepositoryTopics({
    repo: appRepository.name,
    names: [...Object.values(defaultTopics)],
  });

  let commit: FileCommit;
  const userLogin = issue.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(issue.user, null, 2)} has no login.`);
  }
  commit = await repositoriesUtils.addFile(appRepository.name, '.gitignore', createGitignore());
  commit = await repositoriesUtils.addFile(appRepository.name, 'README.md', createReadme(newAppIssue));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(environments.int), yaml.dump(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(environments.prod), yaml.dump(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, '.github/dependabot.yaml', createDependabot(newAppIssue, userLogin));
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/jsonSchemas.xml', createJsonSchemas());
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/vcs.xml', createVcs());
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/encodings.xml', createEncodings());
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/modules.xml', createModules(newAppIssue));
  commit = await repositoriesUtils.addFile(appRepository.name, `.idea/${repoName(newAppIssue.appSpec?.name)}.iml`, createRootModule(newAppIssue));

  if (newAppIssue.generateAngularStub) {
    const name = angularStubName;
    commit = await repositoriesUtils.addFile(appRepository.name, `.idea/runConfigurations/install.xml`, createNpmInstallRunConfig());
    commit = await repositoriesUtils.addFile(appRepository.name, `.idea/runConfigurations/start.xml`, createNpmStartRunConfig());
    appSpec = await updateAppDeployments(appSpec, name,
      {
        auth: {
          oauth2: {
            enabled: true
          },
        },
        container: {
          image: imageName(appSpec.name, name),
          tag: 'latest',
          tmpDirs: ['/tmp']
        }
      },
      'ui/',
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
    commit = await repositoriesUtils.addFile(appRepository.name, `.idea/misc.xml`, createMisc(javaVersion));
    commit = await repositoriesUtils.addFile(appRepository.name, `.idea/runConfigurations/${name}.xml`, createQuarkusDevRunConfig());
    appSpec = await updateAppDeployments(appSpec, name,
      {
        auth: {
          oauth2: {
            enabled: true
          },
        },
        container: {
          image: imageName(appSpec.name, name),
          tag: 'latest',
          tmpDirs: ['/tmp'],
          capabilities: ['DAC_OVERRIDE'],
          resources: {
            requests: {
              memoryMiB: 128
            },
            limits: {
              memoryMiB: 256
            }
          }
        }
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

  commit = await repositoriesUtils.addFile(
    appRepository.name,
    `.github/workflows/${deployAppWorkflowFileName}`,
    createDeployWorkflow());
  commit = await repositoriesUtils.addFile(
    appRepository.name,
    `.github/workflows/${configChangeWorkflowFileName}`,
    createConfigChangeWorkflow(appSpec));
  commit = await repositoriesUtils.addFile(
    appRepository.name,
    `.github/workflows/${storeSecretsWorkflowFileName}`,
    createStoreSecretsWorkflow());

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
      // skip for now...
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
    commit = await repositoriesUtils.addFile(appRepository.name, `${angularStubName}/${angularStubName}.iml`, createAngularModule(newAppIssue));
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
      await sleep(5_000);
    }
    commit = await repositoriesUtils.addFile(appRepository.name, `${quarkusStubName}/${quarkusStubName}.iml`, createQuarkusModule(newAppIssue, javaVersion));
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
