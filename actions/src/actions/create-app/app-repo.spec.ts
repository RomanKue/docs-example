import {createReadme} from './app-repo';
import {AppSpecV1Beta1} from '../../lib/unity/app-spec';
import {lexMarkdown} from '../../lib/markdown';

describe('app-repo', () => {
  const v1beta1: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo', members: [{qNumber: 'q1234'}]};
  describe('createReadme', () => {
    it('should create readme when app config is passed', () => {
      const content = createReadme(v1beta1);
      expect(content).toContain('foo');
    });
    it('should be parsable markdown when readme is created', () => {
      const content = createReadme(v1beta1);
      expect(lexMarkdown(content)).toBeTruthy();
    });
  });
});
