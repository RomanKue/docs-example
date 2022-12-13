import * as yaml from 'js-yaml';
import {createStoreSecretsWorkflow} from './store-secrets-workflow.js';


describe('store-secrets-workflow', () => {
  describe('createStoreSecretsWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createStoreSecretsWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
