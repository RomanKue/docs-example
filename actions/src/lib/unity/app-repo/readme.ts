import {repoName} from '../app-spec.js';
import {ReadonlyDeep} from 'type-fest';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {angularStubName, quarkusStubName, unityOrg} from '../config.js';

const createQuarkusReadmeSection = (appSpec: ReadonlyDeep<NewAppIssue>) => `

## ${quarkusStubName.toUpperCase()}

The folder \`${quarkusStubName}\` contains a [Quarkus](https://quarkus.io) application.
In the [${quarkusStubName}/README.md](${quarkusStubName}/README.md) you will find instructions on how to run an develop
locally.

The [ci-${quarkusStubName}](https://atc-github.azure.cloud.bmw/${unityOrg}/${repoName(appSpec.appSpec?.name)}/actions/workflows/ci-${quarkusStubName}.yaml) workflow builds the application and deploys it to UNITY.
`;

const createAngularReadmeSection = (appSpec: ReadonlyDeep<NewAppIssue>) => `

## ${angularStubName.toUpperCase()}

The folder \`${angularStubName}\` contains an [Angular](https://angular.io) application.
In the [${angularStubName}/README.md](${angularStubName}/README.md) you will find instructions on how to run an develop
locally.
[\`@bmw-ds/components\`](http://density.bmwgroup.net) are already added to the dependencies.

The [ci-${angularStubName}](https://atc-github.azure.cloud.bmw/${unityOrg}/${repoName(appSpec.appSpec?.name)}/actions/workflows/ci-${angularStubName}.yaml) workflow builds the application and deploys it to UNITY.
`;

export const createReadme = (appSpec: ReadonlyDeep<NewAppIssue>) => `
# ${appSpec.appSpec?.name}

## Configuration

A UNITY app is configured via one [YAML](https://yaml.org) file per environment.

 * [unity-app.int.yaml](./unity-app.int.yaml) is the configuration that should be deployed on the int stage.
 * [unity-app.prod.yaml](./unity-app.prod.yaml) is the configuration that should be deployed on the prod stage.

Usually, these configurations differ in the image tags of your app versions.
${appSpec.generateQuarkusStub ? createQuarkusReadmeSection(appSpec) : ''}
${appSpec.generateAngularStub ? createAngularReadmeSection(appSpec) : ''}
`.trim();

