import * as yaml from 'js-yaml';
import {createConfigChangeIntWorkflow} from './config-change-int-workflow.js';
import {AppSpecV1Beta1} from '../../app-spec.js';


describe('config-change-int-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  describe('createConfigChangeIntWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createConfigChangeIntWorkflow(appSpec);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
