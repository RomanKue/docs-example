import {createMakeStubWorkflow} from './make-stub-workflow.js';
import * as yaml from 'js-yaml';


describe('make-stub-workflow', () => {
  describe('createMakeStubWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createMakeStubWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
