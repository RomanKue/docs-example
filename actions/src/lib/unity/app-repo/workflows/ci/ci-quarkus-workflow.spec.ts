import * as yaml from 'js-yaml';
import {createCiQuarkusWorkflow} from './ci-quarkus-workflow.js';


describe('ci-quarkus-workflow', () => {
  describe('createCiQuarkusWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiQuarkusWorkflow('foo');
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should fail when yaml contains single quotes, since this will cause issues when using this from the job output', () => {
      const s = createCiQuarkusWorkflow('foo');
      expect(s).not.toContain("'");
    });
  });
});
