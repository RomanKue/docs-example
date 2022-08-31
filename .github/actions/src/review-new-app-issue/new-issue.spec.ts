import {describe, expect, it} from '@jest/globals';
import {
  isTermsOfServiceAccepted,
  NewAppIssue,
  parseIssueBody,
  shouldDGenerateAngularStub,
  shouldGenerateQuarkusStub
} from './new-issue';

describe('new-issue', () => {
  describe('parseIssueBody', () => {
    it('should return empty object when issue body is empty', () => {
      expect(parseIssueBody('')).toBeInstanceOf(NewAppIssue);
    });
    it('should parse when issue is correct', () => {
      const md = `
I wish to run my app in UNITY. Here is the configuration I would like to start with:

\`\`\`yaml
apiVersion: v1beta1
name: <my-app-name>
\`\`\`

**Application Components**

 * [x] please generate a front-end [Angular](http://angular.io) stub from a template for me.
 * [x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.

**The Way We Work Together**

 * [x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html).
    `;

      const newAppIssue = parseIssueBody(md);
      expect(newAppIssue.appYaml).toEqual('apiVersion: v1beta1\nname: <my-app-name>');
      expect(newAppIssue.generateAngularStub).toBe(true);
      expect(newAppIssue.generateQuarkusStub).toBe(true);
      expect(newAppIssue.termsOfServiceAccepted).toBe(true);
    });
  });

  describe('shouldDGenerateAngularStub', () => {
    it('should be false when string is empty', () => {
      expect(shouldDGenerateAngularStub('')).toBeFalsy();
    });
    it('should be true when checkbox checked', () => {
      expect(shouldDGenerateAngularStub('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.')).toBeTruthy();
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
