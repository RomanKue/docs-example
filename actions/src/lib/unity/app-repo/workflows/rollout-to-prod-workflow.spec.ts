import * as yaml from 'js-yaml';
import {createRolloutToProdWorkflow} from './rollout-to-prod-workflow';
import {NewAppIssue} from '../../issues/new-app/new-app-issue';

describe('rollout-to-prod-workflow', () => {
  describe('rolloutToProdWorkflow', () => {
    it('should be parsable yaml when workflow is created when quarkus stub and angular stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: true};
      const s = createRolloutToProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created when no quarkus stub and angular stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: true, generateQuarkusStub: false};
      const s = createRolloutToProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created when quarkus stub and no angular stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: true};
      const s = createRolloutToProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
    it('should be parsable yaml when workflow is created when no quarkus stub and no angular stub', () => {
      const newAppIssue: NewAppIssue = {appSpec: undefined, termsOfServiceAccepted: true, generateAngularStub: false, generateQuarkusStub: false};
      const s = createRolloutToProdWorkflow(newAppIssue);
      expect(yaml.load(s)).toBeTruthy();
    });
  });
});
