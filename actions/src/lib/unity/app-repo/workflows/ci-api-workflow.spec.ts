import * as yaml from 'js-yaml';
import {createCiApiWorkflow} from './ci-api-workflow';


describe('ci-api-workflow', () => {
  describe('ciApiWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiApiWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
