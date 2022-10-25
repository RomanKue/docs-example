import * as yaml from 'js-yaml';
import {createConfigChangeWorkflow} from './config-change-workflow.js';
import {AppSpecV1Beta1} from '../../app-spec.js';


describe('config-change-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  describe('createConfigChangeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createConfigChangeWorkflow(appSpec);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
