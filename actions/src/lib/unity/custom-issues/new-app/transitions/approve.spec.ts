import {approveIssue} from './approve.js';
import {Issue, SimpleUser} from '../../../../github/api/issues/response/issue.js';
import {mock} from 'jest-mock-extended';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import * as issues from '../../../../github/api/issues/issues.js';
import * as teams from '../../../../github/api/teams/teams.js';
import {setLabelsForAnIssue} from '../../../../github/api/issues/issues.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import {labels, magicComments, unityTeams} from '../../../config.js';
import {expect, jest} from '@jest/globals';
import {getIssueState, issueState} from '../state.js';
import {freeze, produce} from 'immer';
import {partialMock} from '../../../../mock/partial-mock.js';

const addLabel = (issue: Issue, ...labels: string[]) => {
  return produce(issue, draft => {
    labels.forEach(l => {
      draft.labels.push(partialMock<Label>({name: l}));
    });
  });
};

describe('approve', () => {
  describe('approveIssue', () => {
    let issue: Issue;
    let comment: IssueComment;
    let approver: SimpleUser;
    let user: SimpleUser;
    beforeEach(() => {
      issue = freeze(partialMock<Issue>({
        user: partialMock<SimpleUser>({login: 'creator'}),
        labels: [],
      }));
      approver = partialMock<SimpleUser>({login: 'approver'});
      user = partialMock<SimpleUser>({login: 'user'});
      comment = partialMock<IssueComment>({
        user: approver,
      });
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should do nothing when issue is not labeled with new app label', async () => {
      await approveIssue(issue, comment);

      expect(getIssueState(issue)).toBeNull();
    });
    it('should do nothing when issue is closed ', async () => {
      produce(issue, draft => {
        draft.closed_at = new Date().toISOString();
      });
      await approveIssue(issue, comment);

      expect(getIssueState(issue)).toBeNull();
    });
    it('should do nothing when issue is in different state ', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      await approveIssue(issue, comment);

      expect(getIssueState(issue)).toEqual(issueState.waitingForReview)
    });
    it('should not approve when commented from approver with non matching comment', async () => {
      jest.spyOn(teams, 'listMembersInOrg').mockResolvedValue([approver]);
      jest.spyOn(issues, 'lockAnIssue').mockResolvedValue();
      jest.spyOn(issues, 'setLabelsForAnIssue').mockResolvedValue(mock<Label[]>());

      issue = addLabel(issue, labels.newApp, issueState.waitingForApproval);

      comment = partialMock<IssueComment>({
        user: approver,
      });
      await approveIssue(issue, comment);

      expect(teams.listMembersInOrg).not.toHaveBeenCalled();
      expect(issues.setLabelsForAnIssue).not.toHaveBeenCalled();
    });
    it('should approve when approved by comment from approver', async () => {
      jest.spyOn(teams, 'listMembersInOrg').mockResolvedValue([approver]);
      jest.spyOn(issues, 'lockAnIssue').mockResolvedValue();
      jest.spyOn(issues, 'setLabelsForAnIssue').mockResolvedValue(mock<Label[]>());

      issue = addLabel(issue, labels.newApp, issueState.waitingForApproval);

      comment = partialMock<IssueComment>({
        user: approver,
        body: magicComments.lgtm,
      });
      await approveIssue(issue, comment);

      expect(teams.listMembersInOrg).toHaveBeenCalledWith({
        'team_slug': unityTeams.unityAppApproversSlug,
      });
      expect(issues.lockAnIssue).toHaveBeenCalled();
      expect(issues.setLabelsForAnIssue).toHaveBeenCalledWith(expect.objectContaining({
        labels: [labels.newApp, issueState.approved]
      }));
    });
    it('should not approve when approved by comment from non-approver', async () => {
      jest.spyOn(teams, 'listMembersInOrg').mockResolvedValue([approver]);
      jest.spyOn(issues, 'lockAnIssue').mockResolvedValue();
      jest.spyOn(issues, 'setLabelsForAnIssue').mockResolvedValue(mock<Label[]>());
      jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(mock<IssueComment>());

      issue = addLabel(issue, labels.newApp, issueState.waitingForApproval);

      comment = partialMock<IssueComment>({
        user: user,
        body: magicComments.lgtm,
      });
      await approveIssue(issue, comment);

      expect(teams.listMembersInOrg).toHaveBeenCalledWith({
        'team_slug': unityTeams.unityAppApproversSlug,
      });
      expect(issues.lockAnIssue).not.toHaveBeenCalled();
      expect(issues.setLabelsForAnIssue).not.toHaveBeenCalled();
      expect(issues.commentOnIssue).toHaveBeenCalledWith({
        body:
          '🚫 @user you are not allowed to approve by commenting "LGTM". Please ask one of the following users to approve this issue: @approver.'
      });
    });
  });
});
