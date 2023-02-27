import {Issue} from '../../../../github/api/issues/response/issue';
import {partialMock} from '../../../../mock/partial-mock';
import {freeze, produce} from 'immer';
import {removeApprovalRequest} from './remove-approval-request';
import {Label} from '../../../../github/api/issues/response/label';
import issues from '../../../../github/api/issues';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment';
import {labels} from '../../../config';
import {jest} from '@jest/globals';
import teams from '../../../../github/api/teams';
import {SimpleUser} from '../../../../github/api/teams/response/simple-user';
import { issueState } from '../../issue-state';

const addLabel = (issue: Issue, ...labels: string[]) => {
  return produce(issue, draft => {
    labels.forEach(l => {
      draft.labels.push(partialMock<Label>({name: l}));
    });
  });
};

describe('remove-approval-request', () => {
  let issue: Issue;
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = freeze(partialMock<Issue>({
      user: user,
      labels: [],
    }));

    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
    jest.spyOn(issues, 'setLabelsForAnIssue').mockResolvedValue([]);
    jest.spyOn(issues, 'removeAssigneesFromAnIssue').mockResolvedValue(partialMock<Issue>());
    jest.spyOn(teams, 'listMembersInOrg').mockResolvedValue([user]);
  });
  describe('removeApprovalRequest', () => {
    it('should remove approval request when issue is waiting for approval', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForApproval);
      await removeApprovalRequest(issue);
      expect(issues.setLabelsForAnIssue).toHaveBeenCalled();
      expect(issues.removeAssigneesFromAnIssue).toHaveBeenCalledWith({assignees: [user.login]});
    });
    it('should not remove approval request when issue is not waiting for approval', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      await removeApprovalRequest(issue);
      expect(issues.setLabelsForAnIssue).not.toHaveBeenCalled();
      expect(issues.removeAssigneesFromAnIssue).not.toHaveBeenCalled();
    });
  });
});
