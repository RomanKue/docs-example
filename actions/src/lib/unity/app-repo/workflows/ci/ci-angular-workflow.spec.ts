import {createCiAngularWorkflow} from './ci-angular-workflow.js';
import * as yaml from 'js-yaml';


describe('ci-angular-workflow', () => {
  describe('createCiAngularWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiAngularWorkflow('foo');
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should fail when yaml contains single quotes, since this will cause issues when using this from the job output', () => {
      const s = createCiAngularWorkflow('foo');
      expect(s).not.toContain("'");
    });
  });
});
