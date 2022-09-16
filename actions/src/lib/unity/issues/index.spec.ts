import {getIssueType} from './index.js';
import {Issue} from '../../github/api/issues/response/issue.js';
import {partialMock} from '../../mock/partial-mock.js';
import {Label} from '../../github/api/issues/response/label.js';
import {labels} from '../config.js';
import {issueType} from './new-app/index.js';

describe('index.ts', () => {
  describe('getIssueType', () => {
    it('should be null when label is not set', () => {
      const issue = partialMock<Issue>({
        labels: []
      });
      expect(getIssueType(issue)).toBeNull();
    });
    it('should be new app issue when label is set correctly', () => {
      const issue = partialMock<Issue>({
        labels: [
          partialMock<Label>({name: labels.newApp}),
        ]
      });
      expect(getIssueType(issue)).toEqual(issueType.newApp);
    });
    it('should be decommission app issue when label is set correctly', () => {
      const issue = partialMock<Issue>({
        labels: [
          partialMock<Label>({name: labels.decommissionApp}),
        ]
      });
      expect(getIssueType(issue)).toEqual(issueType.decommissionApp);
    });
  });
});
