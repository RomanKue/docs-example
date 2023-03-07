import * as yaml from 'js-yaml';
import {createCiApiNoChangeWorkflow} from './ci-api-no-change-workflow';


describe('ci-api-no-change-workflow', () => {
  describe('ciApiNoChangeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiApiNoChangeWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
