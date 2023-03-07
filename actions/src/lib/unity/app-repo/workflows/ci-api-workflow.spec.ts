import * as yaml from 'js-yaml';
import {AppSpecV1Beta1} from '../../app-spec.js';
import {createCiApiWorkflow} from './ci-api-workflow';


describe('ci-api-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  describe('ciApiWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiApiWorkflow(appSpec);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
