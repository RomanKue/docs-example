import {isMagicComment, isUnityBotComment, magicComments, unityBot} from './config.js';
import {partialMock} from '../mock/partial-mock.js';
import {IssueComment} from '../github/api/issues/response/issue-comment.js';
import {SimpleUser} from '../github/api/teams/response/simple-user.js';

describe('config', () => {
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
  });
  describe('isUnityBotComment', () => {
    it('should be true when comment is from unity bot', () => {
      const bot = partialMock<SimpleUser>({login: unityBot});
      const comment = partialMock<IssueComment>({user: bot});
      expect(isUnityBotComment(comment)).toBeTruthy();
    });
    it('should be false when comment is not from unity bot', () => {
      const comment = partialMock<IssueComment>({user});
      expect(isUnityBotComment(comment)).toBeFalsy();
    });
  });
  describe('isMagicComment', () => {
    it('should be true when comment contains unity bot and magic string', () => {
      const comment = partialMock<IssueComment>({user: user, body: `@${unityBot} ${magicComments.review}`});
      expect(isMagicComment(comment, magicComments.review)).toBeTruthy();
    });
    it('should be false when comment does not contain unity bot', () => {
      const comment = partialMock<IssueComment>({user: user, body: `${magicComments.review}`});
      expect(isMagicComment(comment, magicComments.review)).toBeFalsy();
    });
    it('should be false when comment does not contain magic string', () => {
      const comment = partialMock<IssueComment>({user: user, body: `@${unityBot}`});
      expect(isMagicComment(comment, magicComments.review)).toBeFalsy();
    });
  });
});
