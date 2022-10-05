import {ReadonlyDeep} from 'type-fest';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {angularStubName, quarkusStubName, repoUrl} from '../config.js';
import {deployAppWorkflowFileName} from './workflows/deploy-workflow.js';


const createQuarkusReadmeSection = (newAppIssue: ReadonlyDeep<NewAppIssue>) => `
## ${quarkusStubName.toUpperCase()}

The folder \`${quarkusStubName}\` contains a [Quarkus](https://quarkus.io) application.
In the [${quarkusStubName}/README.md](${quarkusStubName}/README.md) you will find instructions on how to run an develop
locally.

The [ci-${quarkusStubName}](${repoUrl(newAppIssue.appSpec?.name)}/actions/workflows/ci-${quarkusStubName}.yaml) workflow builds the application and deploys it to UNITY.
`;

const createAngularReadmeSection = (newAppIssue: ReadonlyDeep<NewAppIssue>) => `
## ${angularStubName.toUpperCase()}

The folder \`${angularStubName}\` contains an [Angular](https://angular.io) application.
In the [${angularStubName}/README.md](${angularStubName}/README.md) you will find instructions on how to run an develop
locally.
[\`@bmw-ds/components\`](http://density.bmwgroup.net) are already added to the dependencies.

The [ci-${angularStubName}](${repoUrl(newAppIssue.appSpec?.name)}/actions/workflows/ci-${angularStubName}.yaml) workflow builds the application and deploys it to UNITY.
`;


const createBadge = (appName: string | undefined, workflowName: string) => {
  const url = `${repoUrl(appName)}/actions/workflows/${workflowName}`;
  return `[![${workflowName}](${url}/badge.svg)](${url})`;
};

export const createReadme = (newAppIssue: ReadonlyDeep<NewAppIssue>) => `
# ${newAppIssue.appSpec?.name}

${createBadge(newAppIssue.appSpec?.name, deployAppWorkflowFileName)}
${newAppIssue.generateQuarkusStub ? createBadge(newAppIssue.appSpec?.name, `ci-${quarkusStubName}.yaml`) : ''}
${newAppIssue.generateAngularStub ? createBadge(newAppIssue.appSpec?.name, `ci-${angularStubName}.yaml`) : ''}

## Configuration

A UNITY app is configured via one [YAML](https://yaml.org) file per environment.

 * [unity-app.int.yaml](./unity-app.int.yaml) is the configuration that should be deployed on the int stage.
 * [unity-app.prod.yaml](./unity-app.prod.yaml) is the configuration that should be deployed on the prod stage.

Usually, these configurations differ in the image tags of your app versions.

${newAppIssue.generateQuarkusStub ? createQuarkusReadmeSection(newAppIssue) : ''}
${newAppIssue.generateAngularStub ? createAngularReadmeSection(newAppIssue) : ''}
`.trim();

