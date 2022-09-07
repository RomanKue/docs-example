import {AppSpecV1Beta1} from '../app-spec.js';
import {createGitignore} from './gitignore.js';

describe('gitignore', () => {
  describe('createGitignore', () => {
    it('should contain node_modules when gitignore is created', () => {
      const content = createGitignore();
      expect(content).toContain('node_modules');
    });
  });
});
