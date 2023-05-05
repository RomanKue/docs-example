import {validateDecommissionAppIssue} from './validation';
import {DecommissionAppIssue} from './decommission-app-issue';
import {partialMock} from '../../../mock/partial-mock';
import {Issue} from '../../../github/api/issues/response/issue';
import {SimpleUser} from '../../../github/api/teams/response/simple-user';
import {Label} from '../../../github/api/issues/response/label';
import {issueState} from '../issue-state';
import {issueType} from '../issue-type';
import {AppSpec, repoName} from '../../app-spec';
import {repositoriesUtils} from '../../../github/api/repos';
import {issuesUtils} from '../../../github/api/issues';
import * as repositories from '../../../github/api/repos/repositories.js';
import {Topic} from '../../../github/api/repos/response/topic';
import {defaultTopics, unityAppAdminRole} from '../../config';
import * as issues from '../../../github/api/issues/issues.js';

describe('validation', () => {
  describe('validateDecommissionAppIssue', () => {
    it('should throw error when app name could not be determined', async () => {
      jest.spyOn(repositoriesUtils, 'isRepoExistent').mockResolvedValue(false as never);
      try {
        await validateDecommissionAppIssue({} as DecommissionAppIssue, getValidIssueMock());
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toContain('could not parse appSpec from issue');
        }
      }

      expect(repositoriesUtils.isRepoExistent).not.toHaveBeenCalled();
    });
    it('should return false and add a comment when repository does not exist', async () => {
      jest.spyOn(repositoriesUtils, 'isRepoExistent').mockResolvedValue(false as never);
      jest.spyOn(issuesUtils, 'addSimpleComment').mockResolvedValue(undefined as never);
      jest.spyOn(repositories, 'getAllRepositoryTopics').mockResolvedValue(null as never);

      const response = await validateDecommissionAppIssue(getDecommissionAppMock(), getValidIssueMock());

      expect(response).toBe(false);
      expect(repositoriesUtils.isRepoExistent).toHaveBeenCalled();
      expect(issuesUtils.addSimpleComment).toHaveBeenCalled();
      expect(repositories.getAllRepositoryTopics).not.toHaveBeenCalled();
    });

    it('should return false and add a comment when repository does not have unity topic', async () => {
      jest.spyOn(repositoriesUtils, 'isRepoExistent').mockResolvedValue(true as never);
      jest.spyOn(issuesUtils, 'addSimpleComment').mockResolvedValue(undefined as never);
      const topic: Topic = { names: [] };
      jest.spyOn(repositories, 'getAllRepositoryTopics').mockResolvedValue(topic as never);
      jest.spyOn(repositories, 'getRepositoryPermissionForAUser').mockResolvedValue({} as never);
      const decommissionAppMock = getDecommissionAppMock();
      const repositoryName = repoName(decommissionAppMock?.appSpec?.name as string);
      const response = await validateDecommissionAppIssue(decommissionAppMock, getValidIssueMock());

      expect(response).toBe(false);
      expect(repositoriesUtils.isRepoExistent).toHaveBeenCalled();
      expect(issuesUtils.addSimpleComment).toHaveBeenCalled();
      expect(repositories.getAllRepositoryTopics).toHaveBeenCalledWith(repositoryName);
      expect(repositories.getRepositoryPermissionForAUser).not.toHaveBeenCalled();
    });

    it('should return false, comment and close the issue when the user does not have permission to decommission the app', async () => {
      jest.spyOn(repositoriesUtils, 'isRepoExistent').mockResolvedValue(true as never);
      jest.spyOn(issuesUtils, 'addSimpleComment').mockResolvedValue(undefined as never);
      const topic: Topic = { names: [defaultTopics.unityApp] };
      jest.spyOn(repositories, 'getAllRepositoryTopics').mockResolvedValue(topic as never);
      jest.spyOn(repositories, 'getRepositoryPermissionForAUser').mockResolvedValue({} as never);
      jest.spyOn(issues, 'updateAnIssue').mockResolvedValue(undefined as never);

      const decommissionAppMock = getDecommissionAppMock();
      const repositoryName = repoName(decommissionAppMock?.appSpec?.name as string);
      const validGithubIssue = getValidIssueMock();
      const response = await validateDecommissionAppIssue(decommissionAppMock, validGithubIssue);

      expect(response).toBe(false);
      expect(repositoriesUtils.isRepoExistent).toHaveBeenCalled();
      expect(issuesUtils.addSimpleComment).toHaveBeenCalled();
      expect(repositories.getAllRepositoryTopics).toHaveBeenCalledWith(repositoryName);
      expect(repositories.getRepositoryPermissionForAUser).toHaveBeenCalledWith({
        repositoryName,
        username: validGithubIssue?.user?.login as string
      });
      expect(issues.updateAnIssue).toHaveBeenCalledWith({
        state: 'closed',
      });
    });
    it('should return true if everything is valid', async () => {
      jest.spyOn(repositoriesUtils, 'isRepoExistent').mockResolvedValue(true as never);
      jest.spyOn(issuesUtils, 'addSimpleComment').mockResolvedValue(undefined as never);
      const topic: Topic = { names: [defaultTopics.unityApp] };
      jest.spyOn(repositories, 'getAllRepositoryTopics').mockResolvedValue(topic as never);
      jest.spyOn(repositories, 'getRepositoryPermissionForAUser').mockResolvedValue({ role_name: unityAppAdminRole } as never);
      jest.spyOn(issues, 'updateAnIssue').mockResolvedValue(undefined as never);

      const response = await validateDecommissionAppIssue(getDecommissionAppMock(), getValidIssueMock());

      expect(response).toBe(true);
      expect(repositoriesUtils.isRepoExistent).toHaveBeenCalled();
      expect(issuesUtils.addSimpleComment).not.toHaveBeenCalled();
      expect(repositories.getAllRepositoryTopics).toHaveBeenCalled();
      expect(repositories.getRepositoryPermissionForAUser).toHaveBeenCalled();
      expect(issues.updateAnIssue).not.toHaveBeenCalled();
    });
  });
});

const getValidIssueMock = (): Issue => {
  return partialMock<Issue>({
    number: 1,
    user: partialMock<SimpleUser>({ login: 'creator' }),
    labels: [
      partialMock<Label>({name: issueState.waitingForReview}),
      partialMock<Label>({name: issueType.decommissionApp})
    ],
  });
};

const getDecommissionAppMock = (): DecommissionAppIssue => {
  const appSpecMock = partialMock<AppSpec>({name: 'app-to-decommission'});
  return  new DecommissionAppIssue(appSpecMock);
};
