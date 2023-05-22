import {
  isTermsOfServiceAccepted,
  NewAppIssue,
  parseIssueBody, getDisplayMode,
  shouldGenerateAngularStub,
  shouldGenerateQuarkusStub
} from './new-app-issue.js';
import * as fs from 'fs';

describe('new-app-issue', () => {
  describe('parseIssueBody', () => {
    it('should return empty object when issue body is empty', () => {
      expect(parseIssueBody('')).toBeInstanceOf(NewAppIssue);
    });
    it('should parse when loading template file', () => {
      const md = fs.readFileSync('../.github/ISSUE_TEMPLATE/new-app.md', 'utf8');
      const newAppIssue = parseIssueBody(md);
      expect(newAppIssue.appSpec?.apiVersion).toEqual('v1');
      expect(newAppIssue.appSpec?.name).toEqual('<my-app-name>');
      expect(newAppIssue.generateAngularStub).toBe(true);
      expect(newAppIssue.generateQuarkusStub).toBe(true);
      expect(newAppIssue.termsOfServiceAccepted).toBe(false);
    });
    it('should delete description and displayName when are default',()=>{
      const md = fs.readFileSync('../.github/ISSUE_TEMPLATE/new-app.md', 'utf8');
      const newAppIssue = parseIssueBody(md);
      expect(newAppIssue.appSpec?.displayName).toBeUndefined();
      expect(newAppIssue.appSpec?.description).toBeUndefined();
    });
    it('should not set display mode when Angular is selected',()=>{
      const md = fs.readFileSync('../.github/ISSUE_TEMPLATE/new-app.md', 'utf8');
      const newAppIssue = parseIssueBody(md);
      expect(newAppIssue.appSpec?.appCatalog?.showAs).toBeUndefined();
    });
  });

  describe('shouldGenerateAngularStub', () => {
    it('should be false when string is empty', () => {
      expect(shouldGenerateAngularStub('')).toBeFalsy();
    });
    it('should be true when checkbox checked', () => {
      expect(shouldGenerateAngularStub('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be true when checkbox checked in upper case', () => {
      expect(shouldGenerateAngularStub('[X] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be true when there is some extra space', () => {
      expect(shouldGenerateAngularStub('[X]  please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be false when checkbox unchecked', () => {
      expect(shouldGenerateAngularStub('[ ] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeFalsy();
    });
  });
  describe('shouldGenerateQuarkusStub', () => {
    it('should be false when string is empty', () => {
      expect(shouldGenerateQuarkusStub('')).toBeFalsy();
    });
    it('should be true when checkbox checked', () => {
      expect(shouldGenerateQuarkusStub('[x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be false when checkbox unchecked', () => {
      expect(shouldGenerateQuarkusStub('[ ] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.')).toBeFalsy();
    });
  });
  describe('isTermsOfServiceAccepted', () => {
    it('should be false when string is empty', () => {
      expect(isTermsOfServiceAccepted('')).toBeFalsy();
    });
    it('should be true when checkbox checked', () => {
      expect(isTermsOfServiceAccepted('[x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html)')).toBeTruthy();
    });
    it('should be false when checkbox unchecked', () => {
      expect(isTermsOfServiceAccepted('[ ] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html)')).toBeFalsy();
    });
  });
  describe('appCatalog.showAs', () => {
    it('should be undefined when Angular is selected', () => {
      expect(getDisplayMode('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeUndefined();
    });
    it('should be undefined when both Angular and Quarkus are selected', () => {
      expect(getDisplayMode('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.\n' +
        '[x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.')).toBeUndefined();
    });
    it('should be Api when only Quarkus is selected', () => {
      expect(getDisplayMode('[x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.')).toBe('API');
    });
    it('should be Hidden when neither Quarkus and Angular are selected', () => {
      expect(getDisplayMode('')).toBe('Hidden');
    });
  });
});
