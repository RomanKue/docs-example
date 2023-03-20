import {AppDeployment, AppSpec, extractAppName, imageName, isV1, isV1Beta1, repoName} from '../app-spec.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {
  angularStubName,
  appEnvironments,
  defaultTopics,
  githubSecretKeys,
  javaDistribution,
  javaVersion,
  makeStubWorkflowId,
  nodeVersion,
  quarkusStubName,
  unityBot,
  unityRepositoryRoles
} from '../config.js';
import {createGitignore} from './gitignore.js';
import {createReadme} from './readme.js';
import {repositoriesUtils} from '../../github/api/repos/index.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  createOrUpdateAnEnvironment,
  replaceAllRepositoryTopics,
  updateBranchProtection
} from '../../github/api/repos/repositories.js';
import {Repository} from '../../github/api/repos/response/repository.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {produce} from 'immer';
import orgs from '../../github/api/orgs/index.js';
import actions from '../../github/api/actions/index.js';
import {Issue} from '../../github/api/issues/response/issue.js';
import {ReadonlyDeep} from 'type-fest';
import {SimpleUser} from '../../github/api/teams/response/simple-user.js';
import {getInput, IssueUpdatedInputs} from '../../github/input.js';
import {createK8sObjects, getEnvironmentKubeConfig} from './k8s.js';
import {assertUnreachable} from '../../run.js';
import {addSimpleComment} from '../../github/api/issues/issues-utils.js';
import {isContentExistent, upsertFile} from '../../github/api/repos/repositories-utils.js';
import * as core from '@actions/core';
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
import {createStoreSecretsWorkflow, storeSecretsWorkflowFileName} from './workflows/store-secrets-workflow.js';
import {
  createDependabotAutoApproveWorkflow,
  dependabotAutoApproveWorkflowFileName
} from './workflows/dependabot-auto-merge-workflow.js';
import {createEncryptWorkflow, encryptWorkflowFileName} from './workflows/encrypt-workflow.js';
import {randomCryptoString} from '../../strings/random.js';
import {createRolloutToProdWorkflow, rolloutToProdWorkflowFileName} from './workflows/rollout-to-prod-workflow.js';
import {ciAngularWorkflowFileName, createCiAngularWorkflow} from './workflows/ci-angular-workflow.js';
import {
  ciAngularNoChangeWorkflowFileName,
  createCiAngularNoChangeWorkflow
} from './workflows/ci-angular-no-change-workflow.js';
import {ciQuarkusWorkflowFileName, createCiQuarkusWorkflow} from './workflows/ci-quarkus-workflow.js';
import {
  ciQuarkusNoChangeWorkflowFileName,
  createCiQuarkusNoChangeWorkflow
} from './workflows/ci-quarkus-no-change-workflow.js';
import {createDeployWorkflow, getDeployWorkflowFileName} from './workflows/deploy-workflow.js';
import {createConfigChangeWorkflow, getConfigChangeWorkflowFileName} from './workflows/config-change-workflow.js';
import {createAPullRequest} from '../../github/api/pulls/pulls.js';
import {createAReference, getAReference} from '../../github/api/git/git.js';

export const appYamlPath = (env: 'int' | 'prod') => `unity-app.${env}.yaml`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const updateAppDeployments = async (
  appSpec: ReadonlyDeep<AppSpec>,
  name: string,
  deployment: AppDeployment,
  redirect?: string,
) => {
  if (isV1Beta1(appSpec) || isV1(appSpec)) {
    appSpec = createAppSpec(appSpec, appEnvironments.int, name, deployment, redirect);
    await repositoriesUtils.updateFile(repoName(appSpec.name), appYamlPath(appEnvironments.int), yaml.dump({...appSpec, environment: appEnvironments.int}));
    appSpec = createAppSpec(appSpec, appEnvironments.prod, name, deployment, redirect);
    await repositoriesUtils.updateFile(repoName(appSpec.name), appYamlPath(appEnvironments.prod), yaml.dump({...appSpec, environment: appEnvironments.prod}));
  }
  return appSpec;
};

const createAppSpec = (appSpec: ReadonlyDeep<AppSpec>, environment: string, name: string, deployment: AppDeployment, redirect?: string) => {
  return produce(appSpec, draft => {
    if (redirect) {
      draft.redirect = redirect;
    }
    draft.environment = environment;
    draft.appId = null;

    const deployments = draft.deployments ?? {};
    deployments[name] = {
      replicas: 2,
      ...deployment,
    };
    draft.deployments = deployments;
  });
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
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(appEnvironments.int), yaml.dump(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath(appEnvironments.prod), yaml.dump(appSpec));
  commit = await repositoriesUtils.addFile(appRepository.name, '.github/dependabot.yaml', createDependabot(newAppIssue, userLogin));
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/jsonSchemas.xml', createJsonSchemas());
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/vcs.xml', createVcs());
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/encodings.xml', createEncodings());
  commit = await repositoriesUtils.addFile(appRepository.name, '.idea/modules.xml', createModules(newAppIssue));
  commit = await repositoriesUtils.addFile(appRepository.name, `.idea/${newAppRepoName}.iml`, createRootModule(newAppIssue));

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
        },
        headers: {
          response: {
            add: {
              // configure a cookie on non-prod to show which environment we are on
              'Set-Cookie': `${newAppRepoName}-${name}-environment=int; Secure; SameSite=Strict; Path=/${appSpec.name}/${name}`
            },
          },
        },
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
        javaVersion: `${javaVersion}`,
        javaDistribution,
        nodeVersion,

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
            enabled: false
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
        javaVersion: `${javaVersion}`,
        javaDistribution,
        nodeVersion,
      }
    });
  }

  // enable branch protection
  const checks = [];
  if (newAppIssue.generateAngularStub) {
    checks.push({context: `ci-${angularStubName}`});
  }
  if (newAppIssue.generateQuarkusStub) {
    checks.push({context: `ci-${quarkusStubName}`});
  }
  await updateBranchProtection({
    repo: appRepository.name,
    branch: 'main',
    enforce_admins: false,
    required_pull_request_reviews: {
      required_approving_review_count: 0
    } as never,
    required_status_checks: {
      strict: false,
      checks: checks
    } as never,
    required_conversation_resolution: true,
    restrictions: {users: [unityBot], teams: []}
  });

  for (const env of Object.values(appEnvironments)) {
    core.debug(`creating environment "${env}"`);
    await createOrUpdateAnEnvironment({
      repo: appRepository.name,
      environment_name: env
    });

    core.debug(`generating token "${env}"`);
    const masterKey = randomCryptoString(32);
    const token = await createK8sObjects(env, appRepository.name, getEnvironmentKubeConfig(env), masterKey);
    await repositoriesUtils.createEnvironmentSecret(appRepository, env, githubSecretKeys.kubernetesToken, token);
    await repositoriesUtils.createEnvironmentSecret(appRepository, env, githubSecretKeys.cryptMasterKey, masterKey);

    switch (env) {
    case 'int':
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, githubSecretKeys.kubernetesHost, getInput<IssueUpdatedInputs>('INT_KUBERNETES_HOST'));
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, githubSecretKeys.kubernetesNamespace, getInput<IssueUpdatedInputs>('INT_KUBERNETES_NAMESPACE'));
      break;
    case 'prod':
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, githubSecretKeys.kubernetesHost, getInput<IssueUpdatedInputs>('PROD_KUBERNETES_HOST'));
      await repositoriesUtils.createEnvironmentSecret(appRepository, env, githubSecretKeys.kubernetesNamespace, getInput<IssueUpdatedInputs>('PROD_KUBERNETES_NAMESPACE'));
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
  upsertWorkflows(appRepository.name, newAppIssue.generateAngularStub, newAppIssue.generateQuarkusStub, newAppIssue.appSpec?.name ?? '');

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

export const upsertWorkflows = async (repo: string, generateAngularStub: boolean, generateQuarkusStub: boolean, appName: string, branch = 'main') => {
  let commit: FileCommit;
  for (const env of Object.values(appEnvironments)) {
    commit = await repositoriesUtils.upsertFile(
      repo,
      `.github/workflows/${getDeployWorkflowFileName(env)}`,
      createDeployWorkflow({generateQuarkusStub, generateAngularStub}, env),
      branch);
  }
  commit = await repositoriesUtils.upsertFile(
    repo,
    `.github/workflows/${rolloutToProdWorkflowFileName}`,
    createRolloutToProdWorkflow({generateQuarkusStub, generateAngularStub}),
    branch);
  commit = await repositoriesUtils.upsertFile(
    repo,
    `.github/workflows/${storeSecretsWorkflowFileName}`,
    createStoreSecretsWorkflow(),
    branch);
  commit = await repositoriesUtils.upsertFile(
    repo,
    `.github/workflows/${dependabotAutoApproveWorkflowFileName}`,
    createDependabotAutoApproveWorkflow(),
    branch);
  commit = await repositoriesUtils.upsertFile(
    repo,
    `.github/workflows/${encryptWorkflowFileName}`,
    createEncryptWorkflow({generateQuarkusStub, generateAngularStub}),
    branch);
  if (generateAngularStub) {
    commit = await upsertFile(repo, `.github/workflows/${ciAngularNoChangeWorkflowFileName}`, createCiAngularNoChangeWorkflow(), branch);
    commit = await upsertFile(repo, `.github/workflows/${ciAngularWorkflowFileName}`, createCiAngularWorkflow({name: appName}), branch);
  }
  if (generateQuarkusStub) {
    commit = await upsertFile(repo, `.github/workflows/${ciQuarkusNoChangeWorkflowFileName}`, createCiQuarkusNoChangeWorkflow(), branch);
    commit = await upsertFile(repo, `.github/workflows/${ciQuarkusWorkflowFileName}`, createCiQuarkusWorkflow(), branch);
  }
  // workflows that are triggered on push should be added last
  for (const env of Object.values(appEnvironments)) {
    commit = await repositoriesUtils.upsertFile(
      repo,
      `.github/workflows/${getConfigChangeWorkflowFileName(env)}`,
      createConfigChangeWorkflow({name: appName}, env));
  }
};

export const recreateRepoAppWorkflows = async (inputs: {repo: string; branch: string, title: string}) => {
  const {repo, branch, title} = inputs;
  const appName = extractAppName(repo);
  const generateAngularStub = await repositoriesUtils.isContentExistent({repo, path: angularStubName});
  const generateQuarkusStub = await repositoriesUtils.isContentExistent({repo, path: quarkusStubName});
  const mainRef = await getAReference({ref: 'main', repo});
  await createAReference({repo, ref: branch, sha: mainRef.object.sha});
  await upsertWorkflows(repo, generateAngularStub, generateQuarkusStub, appName, branch);
  await createAPullRequest(repo, {title, head: branch, base: 'main'});
};
