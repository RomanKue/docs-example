import {AppSpecV1Beta1} from '../app-spec.js';
import {createGitignore} from './gitignore.js';

describe('gitignore', () => {
  const v1beta1: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo', members: [{qNumber: 'q1234'}]};
  describe('createGitignore', () => {
    it('should contain node_modules when gitignore is created', () => {
      const content = createGitignore();
      expect(content).toContain('node_modules');
    });
  });
});
