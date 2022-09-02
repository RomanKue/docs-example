import {AppSpec, isRepoExistent, repoName} from '../../lib/unity/app-spec.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  createOrUpdateFileContents
} from '../../lib/github/api/repos/repositories.js';
import {FileCommit} from '../../lib/github/api/repos/response/file-commit.js';
import * as yaml from 'js-yaml';
import {defaultBranches} from '../../lib/unity/config.js';
import {createAReference} from '../../lib/github/api/git/git.js';

export const createReadme = (appSpec: Readonly<AppSpec>) => `
# ${appSpec.name}
`.trim();

export const createRepository = async (appSpec: AppSpec) => {
  const newAppRepoName = repoName(appSpec.name);
  if (await isRepoExistent(appSpec.name)) {
    throw new Error(`the repository ${newAppRepoName} already exists`);
  }

  const appRepository = await createAnOrganizationRepository({
    name: newAppRepoName,
    visibility: 'internal'
  });

  let commit: FileCommit;
  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: 'app.yaml',
    content: Buffer.from(yaml.dump(appSpec), 'base64').toString(),
    message: `add app.yaml`
  });

  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: 'README.md',
    content: Buffer.from(createReadme(appSpec), 'base64').toString(),
    message: `add app.yaml`
  });

  for (let defaultBranch in Object.values(defaultBranches)) {
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
      });
    }
  }


  return appRepository;
};
