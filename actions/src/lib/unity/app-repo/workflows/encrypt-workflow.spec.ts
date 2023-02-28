import * as yaml from 'js-yaml';
import {createEncryptWorkflow} from './encrypt-workflow.js';


describe('encrypt-workflow', () => {
  describe('createEncryptWorkflow', () => {
    it('should be parsable yaml when workflow is created', () => {
      const s = createEncryptWorkflow({generateAngularStub: true, generateQuarkusStub: true});
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should not contain status step for angular when angular is not generated', () => {
      const s = createEncryptWorkflow({generateAngularStub: false, generateQuarkusStub: true});
      expect(s).not.toContain('ci-ui');
    });
    it('should not contain status step for quarkus when quarkus is not generated', () => {
      const s = createEncryptWorkflow({generateAngularStub: true, generateQuarkusStub: false});
      expect(s).not.toContain('ci-api');
    });
  });
});
