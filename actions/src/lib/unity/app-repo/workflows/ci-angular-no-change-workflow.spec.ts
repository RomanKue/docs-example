import * as yaml from 'js-yaml';
import {createCiAngularNoChangeWorkflow} from './ci-angular-no-change-workflow';


describe('ci-ui-no-change-workflow', () => {
  describe('ciAngularNoChangeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiAngularNoChangeWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
