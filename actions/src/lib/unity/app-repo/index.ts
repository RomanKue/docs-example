import {AppSpec, repoName} from '../app-spec.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {defaultBranches, defaultTopics} from '../config.js';
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
import {createDeployWorkflow, deployAppWorkflowFileName} from './deploy-workflow.js';
import {createMakeStubWorkflow, makeStubWorkflowFileName} from './make-stub-workflow.js';

export const appYamlPath = 'unity-app.yaml';

export const createRepository = async (appSpec: AppSpec): Promise<Repository> => {
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
  commit = await repositoriesUtils.addFile(appRepository.name, `.github/workflows/${makeStubWorkflowFileName}`, createMakeStubWorkflow());
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
    for (const member of appSpec.members) {
      await addARepositoryCollaborator({
        repo: appRepository.name,
        username: member.qNumber,
        permission: 'admin',
      });
    }
  }

  return appRepository;
};
