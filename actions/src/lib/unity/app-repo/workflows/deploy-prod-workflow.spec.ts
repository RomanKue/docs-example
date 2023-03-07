import * as yaml from 'js-yaml';
import {createDeployProdWorkflow} from './deploy-prod-workflow';
import {NewAppIssue} from '../../issues/new-app/new-app-issue';

describe('deploy-prod-workflow', () => {
  describe('createDeployProdWorkflow', () => {
    it('should be parsable yaml when workflow is created with angular stub and quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: true};
      const s = createDeployProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with angular stub and no quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: false};
      const s = createDeployProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with no angular stub and quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: true};
      const s = createDeployProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with no angular stub and no quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: false};
      const s = createDeployProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
