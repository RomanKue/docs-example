import * as yaml from 'js-yaml';
import {AppSpecV1Beta1} from '../../app-spec.js';
import {createConfigChangeWorkflow} from './config-change-workflow';
import {appEnvironments} from '../../config';


describe('config-change-workflow', () => {
  const appSpec: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  describe('createConfigChangeWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createConfigChangeWorkflow(appSpec, appEnvironments.int);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
