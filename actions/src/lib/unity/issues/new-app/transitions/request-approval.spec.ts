import {Issue, SimpleUser} from '../../../../github/api/issues/response/issue.js';
import {partialMock} from '../../../../mock/partial-mock.js';
import {freeze, produce} from 'immer';
import {removeApprovalRequest} from './remove-approval-request.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import {issueState} from '../state.js';
import * as issues from '../../../../github/api/issues/issues.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import {labels} from '../../../config.js';
import {jest} from '@jest/globals';
import * as teams from '../../../../github/api/teams/teams.js';
import {requestApproval} from './request-approval.js';

const addLabel = (issue: Issue, ...labels: string[]) => {
  return produce(issue, draft => {
    labels.forEach(l => {
      draft.labels.push(partialMock<Label>({name: l}));
    });
  });
};

describe('request-approval', () => {
  let issue: Issue;
  let user: SimpleUser;
  let approver: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    approver = partialMock<SimpleUser>({login: 'approver'});
    issue = freeze(partialMock<Issue>({
      user: user,
      labels: [],
    }));

    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
    jest.spyOn(issues, 'setLabelsForAnIssue').mockResolvedValue([]);
    jest.spyOn(issues, 'addAssigneesToAnIssue').mockResolvedValue(partialMock<Issue>());
    jest.spyOn(teams, 'listMembersInOrg').mockResolvedValue([approver]);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('requestApproval', () => {
    it('should request approval when issue is waiting for approval', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForApproval);
      await requestApproval(issue);
      expect(issues.setLabelsForAnIssue).toHaveBeenCalledWith(expect.objectContaining({
        labels: [labels.newApp, issueState.waitingForApproval]
      }));
      expect(issues.addAssigneesToAnIssue).toHaveBeenCalledWith({assignees: [approver.login]});
    });
    it('should approve when issue is created by approver', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForApproval);
      jest.spyOn(teams, 'listMembersInOrg').mockResolvedValue([user]);
      await requestApproval(issue);
      expect(issues.setLabelsForAnIssue).toHaveBeenCalledWith(expect.objectContaining({
        labels: [labels.newApp, issueState.approved]
      }));
      expect(issues.addAssigneesToAnIssue).not.toHaveBeenCalledWith({assignees: [approver.login]});
    });
    it('should not remove approval request when issue is not waiting for approval', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      await removeApprovalRequest(issue);
      expect(issues.setLabelsForAnIssue).not.toHaveBeenCalled();
      expect(issues.addAssigneesToAnIssue).not.toHaveBeenCalled();
    });
  });
});
