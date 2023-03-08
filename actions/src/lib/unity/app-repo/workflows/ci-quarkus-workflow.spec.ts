import * as yaml from 'js-yaml';
import {createCiQuarkusWorkflow} from './ci-quarkus-workflow';


describe('ci-api-workflow', () => {
  describe('ciQuarkusWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiQuarkusWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
