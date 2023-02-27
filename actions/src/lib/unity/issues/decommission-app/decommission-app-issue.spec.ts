import { DecommissionAppIssue, parseIssueBody } from './decommission-app-issue';
import * as fs from 'fs';

describe('decommission-app-issue', () => {
  describe('parseIssueBody', () => {
    it('should return empty object when issue body is empty', () => {
      expect(parseIssueBody('')).toBeInstanceOf(DecommissionAppIssue);
    });
    it('should parse when loading template file', () => {
      const md = fs.readFileSync('../.github/ISSUE_TEMPLATE/decommission-app.md', 'utf8');
      const appIssue = parseIssueBody(md);

      expect(appIssue.appSpec?.name).toEqual('<my-app-name>');
    });
  });
});
