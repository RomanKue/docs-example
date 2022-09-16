import {createRepository, removeOrgMembers} from './index.js';


import * as repositoris from '../../github/api/repos/repositories.js';
import * as git from '../../github/api/git/git.js';
import {Repository} from '../../github/api/repos/response/repository.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import {RepositoryInvitation} from '../../github/api/repos/response/repository-invitation.js';
import {GitReference} from '../../github/api/git/response/git-reference.js';
import {AppSpecV1Beta1} from '../app-spec.js';
import {Topic} from '../../github/api/repos/response/topic.js';
import {partialMock} from '../../mock/partial-mock.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import orgs from '../../github/api/orgs/index.js';
import {Issue} from '../../github/api/issues/response/issue.js';
import {Environment} from '../../github/api/repos/response/environment.js';
import * as k8s from './k8s.js';
import * as input from '../../github/input.js';
import {repositoriesUtils} from '../../github/api/repos/index.js';
import {SimpleUser} from '../../github/api/teams/response/simple-user.js';


describe('index', () => {
  let v1beta1: AppSpecV1Beta1;
  let issue: Issue;
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = partialMock<Issue>({user: user});
    v1beta1 = Object.freeze({apiVersion: 'v1beta1', name: 'foo', members: [{qNumber: 'q1234'}]});
    jest.spyOn(repositoris, 'listOrganizationRepositories').mockResolvedValue([]);
    jest.spyOn(repositoris, 'createAnOrganizationRepository').mockResolvedValue(partialMock<Repository>());
    jest.spyOn(repositoris, 'createOrUpdateFileContents').mockResolvedValue(partialMock<FileCommit>({commit: {sha: 'foo'}}));
    jest.spyOn(repositoris, 'addARepositoryCollaborator').mockResolvedValue(partialMock<RepositoryInvitation>());
    jest.spyOn(repositoris, 'replaceAllRepositoryTopics').mockResolvedValue(partialMock<Topic>());
    jest.spyOn(repositoris, 'createOrUpdateAnEnvironment').mockResolvedValue(partialMock<Environment>());
    jest.spyOn(repositoriesUtils, 'createEnvironmentSecret').mockResolvedValue();
    jest.spyOn(git, 'createAReference').mockResolvedValue(partialMock<GitReference>());
    jest.spyOn(orgs, 'listOrganizationMembers').mockResolvedValue([]);
    jest.spyOn(k8s, 'createServiceAccount').mockResolvedValue('token-string');

    jest.spyOn(input, 'getInput').mockReturnValue('foo');
  });
  describe('createRepository', () => {
    it('should create repo when called with v1beta1 app', async () => {
      const newAppIssue = new NewAppIssue(v1beta1, true, false, false);
      const repository = await createRepository(issue, newAppIssue, v1beta1);
      expect(repository).toBeTruthy();
      expect(repositoris.addARepositoryCollaborator).toHaveBeenCalledTimes(1);
      expect(repositoris.listOrganizationRepositories).toHaveBeenCalledTimes(1);
      expect(repositoris.createAnOrganizationRepository).toHaveBeenCalledTimes(1);
      expect(repositoris.createOrUpdateAnEnvironment).toHaveBeenCalledTimes(2);
      expect(repositoris.replaceAllRepositoryTopics).toHaveBeenCalledTimes(1);

      expect(k8s.createServiceAccount).toHaveBeenCalledTimes(1);

      expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledTimes(3);

      expect(repositoris.createAnOrganizationRepository).toHaveBeenCalledWith(expect.objectContaining({visibility: 'private'}));
    });
  });
  describe('removeOrgMembers', () => {
    let orgMember: SimpleUser;
    let nonOrgMember: SimpleUser;
    beforeEach(() => {
      orgMember = partialMock<SimpleUser>({login: 'orgMember'});
      nonOrgMember = partialMock<SimpleUser>({login: 'nonOrgMember'});

      jest.spyOn(orgs, 'listOrganizationMembers').mockResolvedValue([partialMock<SimpleUser>({login: 'orgMember'})]);
    });
    it('should remove org member when part of app members', async () => {
      const appMembers = await removeOrgMembers([orgMember]);
      expect(appMembers).toHaveLength(0);
    });
    it('should not remove member when user is not org member', async () => {
      const appMembers = await removeOrgMembers([nonOrgMember]);
      expect(appMembers).toHaveLength(1);
      expect(appMembers[0]).toEqual(expect.objectContaining({login: 'nonOrgMember'}));
    });
    it('should not remove only org members when users are mixed of org and is non org members', async () => {
      const appMembers = await removeOrgMembers([nonOrgMember, orgMember]);
      expect(appMembers).toHaveLength(1);
      expect(appMembers[0]).toEqual(expect.objectContaining({login: 'nonOrgMember'}));
    });
  });
});
