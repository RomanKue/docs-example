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

export const appYamlPath = 'unity-app.yaml';
export const makeStubWorkflowFileName = 'make-stub.yaml';
export const makeStubAction = 'make-stub';
export const deployAppWorkflowFileName = 'deploy.yaml';
export const deployAppAction = 'deploy-unity-app';

const createDeployWorkflow = () => `
name: deploy
description: deploy app
on:
  push:
    branches:
      - int
      - prod
jobs:
  deploy:
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v3
      - uses: unity/${deployAppAction}@v1
    `;

const createMakeStubWorkflow = () => `
name: ${makeStubWorkflowFileName}
description: make a stub app and add it to the repository
on:
  workflow_dispatch:
    inputs:
      name:
        description: 'the name of the deployable'
        required: true
        type: string
      type:
        description: the type of stub to create
        required: true
        type: choice
        options:
          - angular
          - quarkus
      branch:
        description: 'the branch where the app should be created'
        required: true
        default: 'main'
        type: string
jobs:
  make-stub:
    permissions:
      contents: write
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.branch }}
      - uses: unity/${makeStubAction}@v1
        env:
          GITHUB_TOKEN: \${{ env.GITHUB_TOKEN }}
        with:
          name: \${{ inputs.name }}
          type: \${{ inputs.type }}
          branch: \${{ inputs.branch }}
    `;

export const createRepository = async (appSpec: AppSpec): Promise<Repository> => {
  const newAppRepoName = repoName(appSpec.name);
  if (await repositoriesUtils.isRepoExistent(appSpec.name)) {
    throw new Error(`the repository ${newAppRepoName} already exists`);
  }

  const appRepository = await createAnOrganizationRepository({
    name: newAppRepoName,
    visibility: 'internal',
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
