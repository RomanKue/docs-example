import {
  isTermsOfServiceAccepted,
  NewAppIssue,
  parseIssueBody,
  shouldDGenerateAngularStub,
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
  });

  describe('shouldDGenerateAngularStub', () => {
    it('should be false when string is empty', () => {
      expect(shouldDGenerateAngularStub('')).toBeFalsy();
    });
    it('should be true when checkbox checked', () => {
      expect(shouldDGenerateAngularStub('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be true when checkbox checked in upper case', () => {
      expect(shouldDGenerateAngularStub('[X] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be true when there is some extra space', () => {
      expect(shouldDGenerateAngularStub('[X]  please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
    });
    it('should be false when checkbox unchecked', () => {
      expect(shouldDGenerateAngularStub('[ ] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeFalsy();
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
});
