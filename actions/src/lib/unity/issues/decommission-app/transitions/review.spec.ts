import {Issue} from '../../../../github/api/issues/response/issue.js';
import {partialMock} from '../../../../mock/partial-mock.js';
import {SimpleUser} from '../../../../github/api/teams/response/simple-user.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import {issueState} from '../../issue-state.js';
import {issueType} from '../../issue-type.js';
import {reviewDecommissionAppIssue} from './review.js';
import * as validation from '../validation.js';
import * as decommissionAppIssue from '../decommission-app-issue.js';
import {DecommissionAppIssue} from '../decommission-app-issue.js';
import {AppSpec} from '../../../app-spec.js';
import * as deliver from './deliver.js';

describe('review', () => {
  it('should do nothing when issue state is not waiting for review', async () => {
    jest.spyOn(decommissionAppIssue, 'parseIssueBody').mockResolvedValue('' as never);

    await reviewDecommissionAppIssue({ ...getValidIssueMock(), labels: [] });

    expect(decommissionAppIssue.parseIssueBody).not.toHaveBeenCalled();
  });

  it('should do nothing when decommission app issue is not valid', async () => {
    const issue = getValidIssueMock();
    const decommissionApp =  getDecommissionAppMock();
    jest.spyOn(decommissionAppIssue, 'parseIssueBody').mockReturnValue(decommissionApp);
    jest.spyOn(validation, 'validateDecommissionAppIssue').mockResolvedValue(false as never);
    jest.spyOn(deliver, 'deliver').mockResolvedValue(null as never);

    await reviewDecommissionAppIssue(getValidIssueMock());

    expect(deliver.deliver).not.toHaveBeenCalled();
  });

  it('should deliver when decommission app issue is valid', async () => {
    const issue = getValidIssueMock();
    const decommissionApp =  getDecommissionAppMock();
    jest.spyOn(decommissionAppIssue, 'parseIssueBody').mockReturnValue(decommissionApp);
    jest.spyOn(validation, 'validateDecommissionAppIssue').mockResolvedValue(true as never);
    jest.spyOn(deliver, 'deliver').mockResolvedValue(null as never);

    await reviewDecommissionAppIssue(getValidIssueMock());

    expect(deliver.deliver).toHaveBeenCalled();
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
