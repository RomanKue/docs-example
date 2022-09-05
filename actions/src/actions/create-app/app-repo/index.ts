import {AppSpec, isRepoExistent, repoName} from '../../../lib/unity/app-spec.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  createOrUpdateFileContents, replaceAllRepositoryTopics
} from '../../../lib/github/api/repos/repositories.js';
import {FileCommit} from '../../../lib/github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {defaultBranches, defaultTopics} from '../../../lib/unity/config.js';
import {createAReference} from '../../../lib/github/api/git/git.js';
import {base64} from '../../../lib/encoding.js';
import {createGitignore} from './gitignore.js';
import {createReadme} from './readme.js';

export const createRepository = async (appSpec: AppSpec) => {
  const newAppRepoName = repoName(appSpec.name);
  if (await isRepoExistent(appSpec.name)) {
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

  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: '.gitignore',
    content: base64(createGitignore()),
    message: `add .gitignore`
  });

  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: 'README.md',
    content: base64(createReadme(appSpec)),
    message: `add README.md`
  });

  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: 'unity-app.yaml',
    content: base64(yaml.dump(appSpec)),
    message: `add unity-app.yaml`
  });

  for (let defaultBranch of Object.values(defaultBranches)) {
    await createAReference({
      repo: appRepository.name,
      ref: `refs/heads/${defaultBranch}`,
      sha: commit.commit.sha!
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
