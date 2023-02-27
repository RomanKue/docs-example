import { Issue } from '../../../github/api/issues/response/issue.js';
import { partialMock } from '../../../mock/partial-mock.js';
import { IssueComment } from '../../../github/api/issues/response/issue-comment.js';
import * as reviewDecommissionAppIssue from './transitions/review.js';
import { labels } from '../../config.js';
import { Label } from '../../../github/api/issues/response/label.js';
import { handleDecommissionAppIssueChange } from './event-handler.js';
import { jest } from '@jest/globals';
import issues from '../../../github/api/issues/index.js';
import { SimpleUser } from '../../../github/api/teams/response/simple-user.js';
import { issueState } from '../issue-state';
import { issueType } from '../issue-type';

describe('event-handler.ts', () => {
  let issue: Issue;
  let comment: IssueComment;
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = partialMock<Issue>({user: user});
    comment = partialMock<IssueComment>({user: user});
    jest.spyOn(reviewDecommissionAppIssue, 'reviewDecommissionAppIssue').mockResolvedValue();
    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
  });
  describe('handleDecommissionAppIssueChange', () => {
    it('should review issue when issue is waiting for review', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: issueType.decommissionApp}),
          partialMock<Label>({name: issueState.waitingForReview}),
        ]
      });
      await handleDecommissionAppIssueChange(issue);
      expect(reviewDecommissionAppIssue.reviewDecommissionAppIssue).toHaveBeenCalled();
    });
    it('should do nothing when issue is not in waiting for review', async () => {
      issue = partialMock<Issue>({
        user: user,
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
          partialMock<Label>({name: labels.delivered}),
        ]
      });
      await handleDecommissionAppIssueChange(issue);
      expect(reviewDecommissionAppIssue.reviewDecommissionAppIssue).not.toHaveBeenCalled();
    });
  });
});
