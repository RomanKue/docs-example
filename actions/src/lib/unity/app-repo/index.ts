import {AppMember, AppSpec, isV1Beta1, repoName} from '../app-spec.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {defaultBranches, defaultTopics, makeStubWorkflowId, unityRepositoryRoles} from '../config.js';
import {createAReference} from '../../github/api/git/git.js';
import {createGitignore} from './gitignore.js';
import {createReadme} from './readme.js';
import {repositoriesUtils} from '../../github/api/repos/index.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  replaceAllRepositoryTopics
} from '../../github/api/repos/repositories.js';
import {Repository} from '../../github/api/repos/response/repository.js';
import {createDeployWorkflow, deployAppWorkflowFileName} from './workflows/deploy-workflow.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {produce} from 'immer';
import orgs from '../../github/api/orgs/index.js';
import actions from '../../github/api/actions/index.js';

export const appYamlPath = 'unity-app.yaml';

const updateAppDeployments = async (appSpec: AppSpec, name: string, replicas = 2) => {
  if (isV1Beta1(appSpec)) {
    appSpec = produce(appSpec, draft => {
      const deployments = draft.deployments ?? {};
      deployments[name] = {replicas};
      draft.deployments = deployments;
    });
    await repositoriesUtils.updateFile(repoName(appSpec.name), appYamlPath, yaml.dump(appSpec));
  }
  return appSpec;
};


export const removeOrgMembers = async (appMembers: AppMember[]) => {
  const orgMembers = (await orgs.listOrganizationMembers()).map(u => u.login);
  if (orgMembers.length >= 100) {
    throw new Error(`need to implement pagination, as there are more org members than can be fetched in one request: ${orgMembers.length}`);
  }
  return appMembers.filter(m => !orgMembers.includes(m.qNumber));
};

export const createRepository = async (
  newAppIssue: NewAppIssue,
  appSpec: AppSpec
): Promise<{ appSpec: AppSpec; appRepository: Repository }> => {
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
  commit = await repositoriesUtils.addFile(appRepository.name, appYamlPath, yaml.dump(appSpec));

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

  // it is important after which commit branching takes place
  for (const defaultBranch of Object.values(defaultBranches)) {
    await createAReference({
      repo: appRepository.name,
      ref: `refs/heads/${defaultBranch}`,
      sha: commit.commit.sha ?? ''
    });
  }

  if ('members' in appSpec) {
    let appMembers = appSpec.members;
    appMembers = await removeOrgMembers(appMembers);
    for (const member of appMembers) {
      await addARepositoryCollaborator({
        repo: appRepository.name,
        username: member.qNumber,
        permission: unityRepositoryRoles as never,
      });
    }
  }

  return {appSpec, appRepository};
};
