import * as yaml from 'js-yaml';
import {createCiQuarkusNoChangeWorkflow} from './ci-quarkus-no-change-workflow';


describe('ci-api-no-change-workflow', () => {
  describe('ciQuarkusNoChangeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiQuarkusNoChangeWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
