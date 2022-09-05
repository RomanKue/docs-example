import {createRepository} from './index.js';

import {mock} from 'jest-mock-extended';

import * as repositoris from '../../../lib/github/api/repos/repositories.js';
import * as git from '../../../lib/github/api/git/git.js';
import {Repository} from '../../../lib/github/api/repos/response/repository.js';
import {FileCommit} from '../../../lib/github/api/repos/response/file-commit.js';
import {RepositoryInvitation} from '../../../lib/github/api/repos/response/repository-invitation.js';
import {GitReference} from '../../../lib/github/api/git/response/git-reference.js';
import {AppSpecV1Beta1} from '../../../lib/unity/app-spec.js';
import {Topic} from '../../../lib/github/api/repos/response/topic.js';


describe('index', () => {
  let v1beta1: AppSpecV1Beta1;
  beforeEach(() => {
    v1beta1 = Object.freeze({apiVersion: 'v1beta1', name: 'foo', members: [{qNumber: 'q1234'}]});
    jest.spyOn(repositoris, 'listOrganizationRepositories').mockResolvedValue([]);
    jest.spyOn(repositoris, 'createAnOrganizationRepository').mockResolvedValue(mock<Repository>());
    jest.spyOn(repositoris, 'createOrUpdateFileContents').mockResolvedValue(mock<FileCommit>());
    jest.spyOn(repositoris, 'addARepositoryCollaborator').mockResolvedValue(mock<RepositoryInvitation>());
    jest.spyOn(repositoris, 'replaceAllRepositoryTopics').mockResolvedValue(mock<Topic>());
    jest.spyOn(git, 'createAReference').mockResolvedValue(mock<GitReference>());
  });
  describe('createRepository', () => {
    it('should create repo when called with v1beta1 app', async () => {
      const repository = await createRepository(v1beta1);
      expect(repository).toBeTruthy();
      expect(repositoris.addARepositoryCollaborator).toHaveBeenCalledTimes(1);
      expect(repositoris.listOrganizationRepositories).toHaveBeenCalledTimes(1);
      expect(repositoris.createAnOrganizationRepository).toHaveBeenCalledTimes(1);
      expect(repositoris.replaceAllRepositoryTopics).toHaveBeenCalledTimes(1);
    });
  });
});
