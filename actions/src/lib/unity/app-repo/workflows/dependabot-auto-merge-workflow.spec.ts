import * as yaml from 'js-yaml';
import {createDependabotAutoMergeWorkflow} from './dependabot-auto-merge-workflow.js';


describe('dependabot-auto-merge-workflow', () => {
  describe('createDependabotAutoMergeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createDependabotAutoMergeWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
