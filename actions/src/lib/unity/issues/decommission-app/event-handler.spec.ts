import {Issue, SimpleUser} from '../../../github/api/issues/response/issue.js';
import {partialMock} from '../../../mock/partial-mock.js';
import {IssueComment} from '../../../github/api/issues/response/issue-comment.js';
import * as reviewIssue from './transitions/review.js';
import {labels, magicComments, unityBot} from '../../config.js';
import {Label} from '../../../github/api/issues/response/label.js';
import {handleIssueChange, handleMagicComments} from './event-handler.js';
import {jest} from '@jest/globals';
import issues from '../../../github/api/issues/index.js';

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
  });
  describe('handleIssueChange', () => {
    it('should review issue when issue is waiting for review', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForReview}),
        ]
      });
      await handleIssueChange(issue);
      expect(reviewIssue.reviewIssue).toHaveBeenCalled();
    });
    it('should request approval issue when issue is waiting for approval', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForApproval}),
        ]
      });
      await handleIssueChange(issue);
      expect(reviewIssue.reviewIssue).not.toHaveBeenCalled();
    });
    it('should do nothing when issue is delivered', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.delivered}),
        ]
      });
      await handleIssueChange(issue);
      expect(reviewIssue.reviewIssue).not.toHaveBeenCalled();
    });
  });
  describe('handleMagicComments', () => {
    it('should ignore comment when magic comment is from unity bot', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForReview}),
        ]
      });
      comment = partialMock<IssueComment>({user: partialMock<SimpleUser>({login: unityBot}), body: `@${unityBot} foo`});
      await handleMagicComments(issue, comment);
      expect(issues.commentOnIssue).not.toHaveBeenCalled();
    });
    it('should comment when magic comment is not understood', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForReview}),
        ]
      });
      comment = partialMock<IssueComment>({user: user, body: `@${unityBot} foo`});
      await handleMagicComments(issue, comment);
      expect(issues.commentOnIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body:
            '@q123456 I am not sure I can help you with your request. Try one of the following comments:\n\n' +
            ' * @qqunit1 review\n' +
            ' * @qqunit1 LGTM\n',
        }));
    });
    it('should review when issue is waiting for review and review is requested via comment', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForReview}),
        ]
      });
      comment = partialMock<IssueComment>({user: user, body: `@${unityBot} ${magicComments.review}`});
      await handleMagicComments(issue, comment);
      expect(issues.commentOnIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('I will start with that right away...')
        }));
      expect(reviewIssue.reviewIssue).toHaveBeenCalled();
    });
    it('should not review when issue is not waiting for review and review is requested via comment', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForApproval}),
        ]
      });
      comment = partialMock<IssueComment>({user: user, body: `@${unityBot} ${magicComments.review}`});
      await handleMagicComments(issue, comment);
      expect(issues.commentOnIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Unfortunately, I can\'t review your issue, as it is not labeled with "waiting for review".')
        }));
    });
    it('should approve when issue is waiting for approval and approve is requested via comment', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForApproval}),
        ]
      });
      comment = partialMock<IssueComment>({user: user, body: `@${unityBot} ${magicComments.lgtm}`});
      await handleMagicComments(issue, comment);
      expect(issues.commentOnIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('@q123456 I understood that you want me to approve the issue.')
        }));
    });
    it('should not approve when issue is not waiting for approve and approve is requested via comment', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.waitingForReview}),
        ]
      });
      comment = partialMock<IssueComment>({user: user, body: `@${unityBot} ${magicComments.lgtm}`});
      await handleMagicComments(issue, comment);
      expect(issues.commentOnIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Unfortunately, I can\'t approve your issue, as it is not labeled with "waiting for approval".')
        }));
    });
  });
});