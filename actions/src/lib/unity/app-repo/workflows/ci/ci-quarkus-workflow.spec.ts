import * as yaml from 'js-yaml';
import {createCiQuarkusWorkflow} from './ci-quarkus-workflow.js';


describe('ci-quarkus-workflow', () => {
  describe('createCiQuarkusWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createCiQuarkusWorkflow('foo');
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
