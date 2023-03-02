import {Issue} from '../../../../github/api/issues/response/issue.js';
import {SimpleUser} from '../../../../github/api/teams/response/simple-user.js';
import {partialMock} from '../../../../mock/partial-mock.js';
import {deliver} from './deliver.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import {issueState} from '../../issue-state.js';
import {issueType} from '../../issue-type.js';
import {DecommissionAppIssue} from '../decommission-app-issue.js';
import {AppSpec, repoName} from '../../../app-spec.js';
import {FullRepository} from '../../../../github/api/repos/response/full-repository';
import * as repositories from '../../../../github/api/repos/repositories.js';
import {issuesUtils} from '../../../../github/api/issues/index.js';
import * as k8s from '../../../app-repo/k8s.js';
import * as githubActions from '../../../../github/api/actions/actions.js';
import * as githubIssues from '../../../../github/api/issues/issues.js';
import {appEnvironments} from '../../../config';
import {KubeConfig} from '@kubernetes/client-node';

describe('deliver', () => {
  it('should do nothing when issue state is not waiting for review', async () => {
    jest.spyOn(repositories, 'getARepository').mockResolvedValue(null as never);

    await deliver({ ...getValidIssueMock(), labels: [] }, getDecommissionAppMock());
    expect(repositories.getARepository).not.toHaveBeenCalled();
  });
  it('should do nothing when issue type is not decommission app', async () => {
    jest.spyOn(repositories, 'getARepository').mockResolvedValue(null as never);
    const approvedIssue = {...getValidIssueMock(), labels: [
      partialMock<Label>({name: issueState.waitingForReview})
    ]};
    await deliver(approvedIssue, getDecommissionAppMock());
    expect(repositories.getARepository).not.toHaveBeenCalled();
  });

  it('should deliver when everything is valid', async () => {
    const issue = getValidIssueMock();
    const decommissionApp = getDecommissionAppMock();

    const repository = partialMock<FullRepository>({name: decommissionApp?.appSpec?.name as string});
    jest.spyOn(repositories, 'getARepository')
      .mockResolvedValue(repository);
    jest.spyOn(repositories, 'updateARepository')
      .mockResolvedValue(repository);

    jest.spyOn(issuesUtils, 'addSimpleComment').mockResolvedValue();

    jest.spyOn(k8s, 'getEnvironmentKubeConfig').mockResolvedValue(new KubeConfig() as never);
    jest.spyOn(k8s, 'deleteK8sObjects').mockResolvedValue();
    jest.spyOn(githubActions, 'deleteAnEnvironmentSecret').mockResolvedValue();

    jest.spyOn(githubIssues, 'setLabelsForAnIssue').mockResolvedValue({} as never);
    jest.spyOn(githubIssues, 'updateAnIssue').mockResolvedValue(issue as never);
    jest.spyOn(githubIssues, 'lockAnIssue').mockResolvedValue(issue as never);

    await deliver(issue, decommissionApp);

    expect(issuesUtils.addSimpleComment).toBeCalledTimes(2);
    expect(repositories.updateARepository).toHaveBeenCalledWith(repoName(repository.name), {archived: true});

    const environmentsCount = Object.values(appEnvironments).length;
    expect(k8s.deleteK8sObjects).toBeCalledTimes(environmentsCount);
    expect(githubActions.deleteAnEnvironmentSecret).toBeCalledTimes(environmentsCount);

    // setIssueState call
    expect(githubIssues.setLabelsForAnIssue).toHaveBeenCalledWith({
      issue_number: issue.number,
      labels: [issueType.decommissionApp, issueState.delivered]
    });
    expect(githubIssues.lockAnIssue).toHaveBeenCalledWith({
      lock_reason: 'resolved'
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
