import {AppSpec, repoName} from '../app-spec.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {defaultBranches, defaultTopics} from '../config.js';
import {createAReference} from '../../github/api/git/git.js';
import {base64} from '../../strings/encoding.js';
import {createGitignore} from './gitignore.js';
import {createReadme} from './readme.js';
import {repositoriesUtils} from '../../github/api/repos/index.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  createOrUpdateFileContents,
  replaceAllRepositoryTopics
} from '../../github/api/repos/repositories.js';
import {Repository} from '../../github/api/repos/response/repository.js';

function createMakeStubWorkflow() {
  return `
name: make-stub
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
  make-stub
    permissions:
      contents: write
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.branch }}
      - uses: unity/make-stub@v1
        with:
          name: \${{ inputs.name }}
          type: \${{ inputs.type }}
          branch: \${{ inputs.branch }}
    `;
}

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

  const addFile = async (path: string, content: string) => {
    return await createOrUpdateFileContents({
      repo: appRepository.name,
      path: path,
      content: base64(content),
      message: `add ${path.split('/').pop()}`
    });

  };
  let commit: FileCommit;
  commit = await addFile('.gitignore', createGitignore());
  commit = await addFile('README.md', createReadme(appSpec));
  commit = await addFile('unity-app.yaml', yaml.dump(appSpec));
  commit = await addFile('.github/workflows/make-stub.yaml', createMakeStubWorkflow());

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
