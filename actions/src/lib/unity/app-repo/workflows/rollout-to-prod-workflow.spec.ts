import * as yaml from 'js-yaml';
import {createRolloutToProdWorkflow} from './rollout-to-prod-workflow';

describe('rollout-to-prod-workflow', () => {
  describe('rolloutToProdWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createRolloutToProdWorkflow();
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
