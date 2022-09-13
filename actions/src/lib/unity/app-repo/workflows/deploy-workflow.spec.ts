import * as yaml from 'js-yaml';
import {createDeployWorkflow} from './deploy-workflow.js';


describe('deploy-workflow', () => {
  describe('createDeployWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createDeployWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
