import {isUnityBotComment, unityBot} from './config.js';
import {partialMock} from '../mock/partial-mock.js';
import {IssueComment, SimpleUser} from '../github/api/issues/response/issue-comment.js';

describe('config', () => {
  describe('isUnityBotComment', () => {
    it('should be true when comment is from unity bot', () => {
      const bot = partialMock<SimpleUser>({login: unityBot});
      const comment = partialMock<IssueComment>({user: bot});
      expect(isUnityBotComment(comment)).toBeTruthy();
    });
    it('should be false when comment is not from unity bot', () => {
      const bot = partialMock<SimpleUser>({login: 'q123456'});
      const comment = partialMock<IssueComment>({user: bot});
      expect(isUnityBotComment(comment)).toBeFalsy();
    });
  });
});
