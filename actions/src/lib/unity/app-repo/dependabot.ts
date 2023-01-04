import {ReadonlyDeep} from 'type-fest';
import {angularStubName, quarkusStubName} from '../config.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {trimEmptyLines} from '../../strings/whitespace.js';


const createForMaven = (userLogin: string) => trimEmptyLines(`
  - package-ecosystem: "maven"
    directory: "/${quarkusStubName}"
    assignees:
      - "${userLogin}"
    reviewers:
      - "${userLogin}"
    pull-request-branch-name:
      separator: "-"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
  `).trimEnd();

const createForNpm = (userLogin: string) => trimEmptyLines(`
  - package-ecosystem: "npm"
    directory: "/${angularStubName}"
    assignees:
      - "${userLogin}"
    reviewers:
      - "${userLogin}"
    pull-request-branch-name:
      separator: "-"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    ignore:
      - dependency-name: "@angular/*"
        update-types:
          - "version-update:semver-major"
      - dependency-name: "@angular-devkit/*"
        update-types:
          - "version-update:semver-major"
    `).trimEnd();

export const createDependabot = (newAppIssue: ReadonlyDeep<NewAppIssue>, userLogin: string) => `
# https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#package-ecosystem
version: 2
updates:
${newAppIssue.generateQuarkusStub ? createForMaven(userLogin) : ''}
${newAppIssue.generateAngularStub ? createForNpm(userLogin) : ''}
`.trim();

