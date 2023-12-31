import {AppSpecV1Beta1} from '../app-spec.js';
import {createReadme} from './readme.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {createDependabot} from './dependabot.js';

describe('dependabot', () => {
  const v1beta1: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo',environment:'test'};
  let newAppIssue: NewAppIssue;
  describe('createReadme', () => {
    it('should create empty dependabot.yaml when app config is passed', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, false, false);
      const content = createDependabot(newAppIssue, 'q1234567');
      expect(content).toEqual(`
# https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#package-ecosystem
version: 2
updates:
`.trim());
    });
    it('should create full dependabot.yaml when app config is passed with stub geneartion enabled', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, true, true);
      const content = createDependabot(newAppIssue, 'q1234567');
      expect(content).toEqual( `
# https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#package-ecosystem
version: 2
updates:
  - package-ecosystem: "maven"
    directory: "/api"
    assignees:
      - "q1234567"
    reviewers:
      - "q1234567"
    pull-request-branch-name:
      separator: "-"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
  - package-ecosystem: "docker"
    directory: "/api/src/main/docker/"
    assignees:
      - "q1234567"
    reviewers:
      - "q1234567"
    schedule:
      interval: "daily"
  - package-ecosystem: "npm"
    directory: "/ui"
    assignees:
      - "q1234567"
    reviewers:
      - "q1234567"
    pull-request-branch-name:
      separator: "-"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    ignore:
      - dependency-name: "@bmw-ds/*"
      - dependency-name: "@angular/*"
        update-types:
          - "version-update:semver-major"
          - "version-update:semver-minor"
      - dependency-name: "@angular-devkit/*"
        update-types:
          - "version-update:semver-major"
          - "version-update:semver-minor"
      - dependency-name: "@angular-eslint/*"
        update-types:
          - "version-update:semver-major"
          - "version-update:semver-minor"
  - package-ecosystem: "docker"
    directory: "/ui/"
    assignees:
      - "q1234567"
    reviewers:
      - "q1234567"
    schedule:
      interval: "daily"
      `.trim()
      );
    });
  });
});
