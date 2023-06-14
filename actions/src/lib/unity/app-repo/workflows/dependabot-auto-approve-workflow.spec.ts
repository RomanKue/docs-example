import * as yaml from 'js-yaml';
import {createDependabotAutoApproveWorkflow} from './dependabot-auto-approve-workflow.js';


describe('dependabot-auto-approve-workflow', () => {
  describe('createDependabotAutoApproveWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createDependabotAutoApproveWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
