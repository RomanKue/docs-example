import {Issue} from '../../../github/api/issues/response/issue.js';
import {partialMock} from '../../../mock/partial-mock.js';
import {IssueComment} from '../../../github/api/issues/response/issue-comment.js';
import * as reviewIssue from './transitions/review.js';
import * as approveIssue from './transitions/approve';
import * as requestApproval from './transitions/request-approval';
import * as deliver from './transitions/deliver.js';
import {labels} from '../../config.js';
import {Label} from '../../../github/api/issues/response/label.js';
import {handleNewAppIssueChange} from './event-handler.js';
import issues from '../../../github/api/issues/index.js';
import {SimpleUser} from '../../../github/api/teams/response/simple-user.js';

describe('event-handler.ts', () => {
  let issue: Issue;
  let comment: IssueComment;
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = partialMock<Issue>({user: user});
    comment = partialMock<IssueComment>({user: user});
    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
    jest.spyOn(reviewIssue, 'reviewIssue').mockResolvedValue();
    jest.spyOn(approveIssue, 'approveIssue').mockResolvedValue();
    jest.spyOn(requestApproval, 'requestApproval').mockResolvedValue();
    jest.spyOn(deliver, 'deliver').mockResolvedValue();
  });
  describe('handleNewAppIssueChange', () => {
    it('should review issue when issue is waiting for review', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.newApp}),
          partialMock<Label>({name: labels.waitingForReview}),
        ]
      });
      await handleNewAppIssueChange(issue);
      expect(reviewIssue.reviewIssue).toHaveBeenCalled();
      expect(requestApproval.requestApproval).not.toHaveBeenCalled();
    });
    it('should request approval issue when issue is waiting for approval', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.newApp}),
          partialMock<Label>({name: labels.waitingForApproval}),
        ]
      });
      await handleNewAppIssueChange(issue);
      expect(reviewIssue.reviewIssue).not.toHaveBeenCalled();
      expect(requestApproval.requestApproval).toHaveBeenCalled();
    });
    it('should deliver when issue is approved', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.newApp}),
          partialMock<Label>({name: labels.approved}),
        ]
      });
      await handleNewAppIssueChange(issue);
      expect(deliver.deliver).toHaveBeenCalled();
    });
    it('should do nothing when issue is delivered', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.newApp}),
          partialMock<Label>({name: labels.delivered}),
        ]
      });
      await handleNewAppIssueChange(issue);
      expect(reviewIssue.reviewIssue).not.toHaveBeenCalled();
      expect(deliver.deliver).not.toHaveBeenCalled();
      expect(requestApproval.requestApproval).not.toHaveBeenCalled();
    });
  });
});
