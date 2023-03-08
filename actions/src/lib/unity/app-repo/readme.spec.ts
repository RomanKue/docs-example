import {AppSpecV1Beta1} from '../app-spec.js';
import {lexMarkdown} from '../../mardown/markdown.js';
import {createReadme} from './readme.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';

describe('readme', () => {
  const v1beta1: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo', environment: 'test'};
  let newAppIssue: NewAppIssue;
  describe('createReadme', () => {
    it('should create readme when app config is passed', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, false, false);
      const content = createReadme(newAppIssue);
      expect(content).toContain('foo');
    });
    it('should be parsable markdown when readme is created', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, false, false);
      const content = createReadme(newAppIssue);
      expect(lexMarkdown(content)).toBeTruthy();
    });
    it('should be parsable markdown when stubs are generated', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, true, true);
      const content = createReadme(newAppIssue);
      expect(lexMarkdown(content)).toBeTruthy();
    });
  });
});
