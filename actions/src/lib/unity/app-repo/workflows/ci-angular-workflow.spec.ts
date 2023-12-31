import * as yaml from 'js-yaml';
import {AppSpecV1Beta1} from '../../app-spec.js';
import {createCiAngularWorkflow} from './ci-angular-workflow';


describe('ci-angular-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo', environment: 'test'};
  describe('ciAngularWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiAngularWorkflow(appSpec);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
