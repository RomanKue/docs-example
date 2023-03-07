import * as yaml from 'js-yaml';
import {createDeployIntWorkflow} from './deploy-int-workflow';
import {NewAppIssue} from '../../issues/new-app/new-app-issue';

describe('deploy-int-workflow', () => {
  describe('createDeployIntWorkflow', () => {
    it('should be parsable yaml when workflow is created with angular stub and quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: true};
      const s = createDeployIntWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with no angular stub and quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: true};
      const s = createDeployIntWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with angular stub and no quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: false};
      const s = createDeployIntWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with no angular stub and no quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: false};
      const s = createDeployIntWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
