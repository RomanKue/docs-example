import {Inputs} from '../../lib/github/input.js';
import * as repositories from '../../lib/github/api/repos/repositories.js';
import {MinimalRepository} from '../../lib/github/api/repos/response/minimal-repository.js';
import {partialMock} from '../../lib/mock/partial-mock.js';
import {repositoriesUtils} from '../../lib/github/api/repos/index.js';
import * as pulls from '../../lib/github/api/pulls/pulls.js';
import * as git from '../../lib/github/api/git/git.js';
import {isContentExistent} from '../../lib/github/api/repos/repositories-utils';
import {recreateAppWorkflows} from './recreate-app-workflows';
import * as input from '../../lib/github/input';
import {FileCommit} from '../../lib/github/api/repos/response/file-commit';
import {PullRequest} from '../../lib/github/api/pulls/response/pull-request';
import {angularStubName, quarkusStubName} from '../../lib/unity/config';
import {GitReference} from '../../lib/github/api/git/response/git-reference';

describe('recreate-app-workflows', () => {
  beforeEach(() => {
    jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue(
      createMockRepos(['app-test', 'app-foo'])
    );
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-.*'));
    jest.spyOn(git, 'createAReference').mockResolvedValue({} as GitReference);
    jest.spyOn(git, 'getAReference').mockResolvedValue({object: {sha: 'sha-123'}} as GitReference);
  });

  it('should create the correct number of workflows when both quarkus and angular', async () => {
    jest.spyOn(repositoriesUtils, 'isContentExistent').mockResolvedValue(true);
    const upsertSpy = jest.spyOn(repositoriesUtils, 'upsertFile').mockImplementation(async () => await {} as Promise<FileCommit>);
    const prSpy = jest.spyOn(pulls, 'createAPullRequest').mockImplementation(async () => await {} as Promise<PullRequest>);

    await recreateAppWorkflows();

    expect(upsertSpy).toHaveBeenCalledTimes(24);
    expect(prSpy).toHaveBeenCalledTimes(2);
  });

  it('should create the correct number of workflows when quarkus and no angular', async () => {
    jest.spyOn(repositoriesUtils, 'isContentExistent').mockImplementation(async (options) => await options.path === quarkusStubName);
    const upsertSpy = jest.spyOn(repositoriesUtils, 'upsertFile').mockImplementation(async () => await {} as Promise<FileCommit>);
    const prSpy = jest.spyOn(pulls, 'createAPullRequest').mockImplementation(async () => await {} as Promise<PullRequest>);

    await recreateAppWorkflows();

    expect(upsertSpy).toHaveBeenCalledTimes(20);
    expect(prSpy).toHaveBeenCalledTimes(2);
  });

  it('should create the correct number of workflows when no quarkus and angular', async () => {
    jest.spyOn(repositoriesUtils, 'isContentExistent').mockImplementation(async (options) => await options.path === angularStubName);
    const upsertSpy = jest.spyOn(repositoriesUtils, 'upsertFile').mockImplementation(async () => await {} as Promise<FileCommit>);
    const prSpy = jest.spyOn(pulls, 'createAPullRequest').mockImplementation(async () => await {} as Promise<PullRequest>);

    await recreateAppWorkflows();

    expect(upsertSpy).toHaveBeenCalledTimes(20);
    expect(prSpy).toHaveBeenCalledTimes(2);
  });

  it('should create the correct number of workflows when no quarkus and no angular', async () => {
    jest.spyOn(repositoriesUtils, 'isContentExistent').mockResolvedValue(false);
    const upsertSpy = jest.spyOn(repositoriesUtils, 'upsertFile').mockImplementation(async () => await {} as Promise<FileCommit>);
    const prSpy = jest.spyOn(pulls, 'createAPullRequest').mockImplementation(async () => await {} as Promise<PullRequest>);

    await recreateAppWorkflows();

    expect(upsertSpy).toHaveBeenCalledTimes(16);
    expect(prSpy).toHaveBeenCalledTimes(2);
  });
});

const createMockRepos = (names: string[]) => {
  return names.map((name, index) => partialMock<MinimalRepository>({name: name, id: index}));
};



const createMockInputs = (repoRegex: string, env?: string) => {
  return (input: Inputs) => {
    switch (input) {
    case 'repository-regex':
      return repoRegex;
    }
    return '';
  };
};
