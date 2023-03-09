import * as yaml from 'js-yaml';
import {NewAppIssue} from '../../issues/new-app/new-app-issue';
import {createDeployWorkflow} from './deploy-workflow';
import {appEnvironments} from '../../config';

describe('deploy-workflow', () => {
  describe('createDeployProdWorkflow', () => {
    it('should be parsable yaml when workflow is created with angular stub and quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: true};
      const s = createDeployWorkflow(newAppIssue, appEnvironments.int);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with angular stub and no quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: false};
      const s = createDeployWorkflow(newAppIssue, appEnvironments.int);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with no angular stub and quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: true};
      const s = createDeployWorkflow(newAppIssue, appEnvironments.int);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created with no angular stub and no quarkus stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: false};
      const s = createDeployWorkflow(newAppIssue, appEnvironments.int);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
