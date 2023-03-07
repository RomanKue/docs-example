import * as yaml from 'js-yaml';
import {AppSpecV1Beta1} from '../../app-spec.js';
import {createCiUiWorkflow} from './ci-ui-workflow';


describe('ci-ui-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  describe('ciUiWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiUiWorkflow(appSpec);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
