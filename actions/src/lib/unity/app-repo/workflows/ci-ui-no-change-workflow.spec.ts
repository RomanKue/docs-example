import * as yaml from 'js-yaml';
import {createCiUiNoChangeWorkflow} from './ci-ui-no-change-workflow';


describe('ci-ui-no-change-workflow', () => {
  describe('ciUiNoChangeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiUiNoChangeWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
