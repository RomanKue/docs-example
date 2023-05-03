import {createRepository, removeOrgMembers} from './index.js';


import * as repositories from '../../github/api/repos/repositories.js';
import {Repository} from '../../github/api/repos/response/repository.js';
import {FileCommit} from '../../github/api/repos/response/file-commit.js';
import {RepositoryInvitation} from '../../github/api/repos/response/repository-invitation.js';
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
import {jest} from '@jest/globals';
import issues from '../../github/api/issues/index.js';
import {IssueComment} from '../../github/api/issues/response/issue-comment.js';
import {ProtectedBranch} from '../../github/api/repos/response/protected-branch.js';
import * as githubActions from '../../github/api/actions/actions.js';


describe('index', () => {
  let v1beta1: AppSpecV1Beta1;
  let issue: Issue;
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = partialMock<Issue>({user: user});
    v1beta1 = Object.freeze({apiVersion: 'v1beta1', name: 'foo', environment:'test', members: [{qNumber: 'q1234'}]});
    jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
    jest.spyOn(repositories, 'createAnOrganizationRepository').mockResolvedValue(partialMock<Repository>());
    jest.spyOn(repositories, 'createOrUpdateFileContents').mockResolvedValue(partialMock<FileCommit>({commit: {sha: 'foo'}}));
    jest.spyOn(repositoriesUtils, 'isContentExistent').mockResolvedValue(true);
    jest.spyOn(repositories, 'addARepositoryCollaborator').mockResolvedValue(partialMock<RepositoryInvitation>());
    jest.spyOn(repositories, 'replaceAllRepositoryTopics').mockResolvedValue(partialMock<Topic>());
    jest.spyOn(repositories, 'createOrUpdateAnEnvironment').mockResolvedValue(partialMock<Environment>());
    jest.spyOn(repositories, 'updateBranchProtection').mockResolvedValue(partialMock<ProtectedBranch>());
    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
    jest.spyOn(repositoriesUtils, 'createEnvironmentSecret').mockResolvedValue();
    jest.spyOn(orgs, 'listOrganizationMembers').mockResolvedValue([]);
    jest.spyOn(k8s, 'createK8sObjects').mockResolvedValue('token-string');
    jest.spyOn(repositoriesUtils, 'updateFile').mockResolvedValue(null as never);
    jest.spyOn(repositoriesUtils, 'addFile').mockResolvedValue(null as never);
    jest.spyOn(repositoriesUtils, 'upsertFile').mockResolvedValue(null as never);
    jest.spyOn(repositoriesUtils, 'deleteFileIfExisting').mockResolvedValue(null as never);

    jest.spyOn(input, 'getInput').mockReturnValue('foo');
  });
  describe('createRepository', () => {
    it('should create repo when called with v1beta1 app', async () => {
      const newAppIssue = new NewAppIssue(v1beta1, true, false, false);
      const repository = await createRepository(issue, newAppIssue, v1beta1);
      expect(repository).toBeTruthy();
      expect(repositories.addARepositoryCollaborator).toHaveBeenCalledTimes(1);
      expect(repositories.listOrganizationRepositories).toHaveBeenCalledTimes(1);
      expect(repositories.createAnOrganizationRepository).toHaveBeenCalledTimes(1);
      expect(repositories.createOrUpdateAnEnvironment).toHaveBeenCalledTimes(2);
      expect(repositories.replaceAllRepositoryTopics).toHaveBeenCalledTimes(1);
      expect(repositories.updateBranchProtection).toHaveBeenCalledTimes(1);

      expect(k8s.createK8sObjects).toHaveBeenCalledTimes(2);

      expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledTimes(8);

      expect(repositories.createAnOrganizationRepository).toHaveBeenCalledWith(expect.objectContaining({visibility: 'private'}));
    });

    it('should create angular stub', async () => {
      const newAppIssue = new NewAppIssue(v1beta1, true, true, false);
      jest.spyOn(githubActions, 'createAWorkflowDispatchEvent').mockResolvedValue();

      const { appRepository, appIntSpec, appProdSpec} = await createRepository(issue, newAppIssue, v1beta1);

      expect(appRepository).toBeTruthy();
      expect(appIntSpec?.deployments?.ui?.headers?.response?.add && appIntSpec.deployments.ui.headers.response.add['Set-Cookie']).toBeTruthy();
      expect(appProdSpec?.deployments?.ui?.headers).toBeUndefined();
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
