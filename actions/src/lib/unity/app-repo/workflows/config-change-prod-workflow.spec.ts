import * as yaml from 'js-yaml';
import {createConfigChangeProdWorkflow} from './config-change-prod-workflow';
import {AppSpecV1Beta1} from '../../app-spec.js';


describe('config-change-prod-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  describe('createConfigChangeProdWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createConfigChangeProdWorkflow(appSpec);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
