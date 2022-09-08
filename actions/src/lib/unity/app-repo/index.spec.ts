import {createRepository} from './index.js';


import * as repositoris from '../../github/api/repos/repositories.js';
import * as git from '../../github/api/git/git.js';
import {Repository} from '../../github/api/repos/response/repository.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import {RepositoryInvitation} from '../../github/api/repos/response/repository-invitation.js';
import {GitReference} from '../../github/api/git/response/git-reference.js';
import {AppSpecV1Beta1} from '../app-spec.js';
import {Topic} from '../../github/api/repos/response/topic.js';
import {partialMock} from '../../mock/partial-mock.js';


describe('index', () => {
  let v1beta1: AppSpecV1Beta1;
  beforeEach(() => {
    v1beta1 = Object.freeze({apiVersion: 'v1beta1', name: 'foo', members: [{qNumber: 'q1234'}]});
    jest.spyOn(repositoris, 'listOrganizationRepositories').mockResolvedValue([]);
    jest.spyOn(repositoris, 'createAnOrganizationRepository').mockResolvedValue(partialMock<Repository>());
    jest.spyOn(repositoris, 'createOrUpdateFileContents').mockResolvedValue(partialMock<FileCommit>({commit: {sha: 'foo'}}));
    jest.spyOn(repositoris, 'addARepositoryCollaborator').mockResolvedValue(partialMock<RepositoryInvitation>());
    jest.spyOn(repositoris, 'replaceAllRepositoryTopics').mockResolvedValue(partialMock<Topic>());
    jest.spyOn(git, 'createAReference').mockResolvedValue(partialMock<GitReference>());
  });
  describe('createRepository', () => {
    it('should create repo when called with v1beta1 app', async () => {
      const repository = await createRepository(v1beta1);
      expect(repository).toBeTruthy();
      expect(repositoris.addARepositoryCollaborator).toHaveBeenCalledTimes(1);
      expect(repositoris.listOrganizationRepositories).toHaveBeenCalledTimes(1);
      expect(repositoris.createAnOrganizationRepository).toHaveBeenCalledTimes(1);
      expect(repositoris.replaceAllRepositoryTopics).toHaveBeenCalledTimes(1);

      expect(repositoris.createAnOrganizationRepository).toHaveBeenCalledWith(expect.objectContaining({visibility: 'private'}));
    });
  });
});
