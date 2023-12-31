import {ReadonlyDeep} from 'type-fest';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {angularStubName, appEnvironments, quarkusStubName, repoUrl} from '../config.js';
import {repoName} from '../app-spec.js';
import {rolloutToProdWorkflowFileName} from './workflows/rollout-to-prod-workflow.js';
import {ciQuarkusWorkflowFileName} from './workflows/ci-quarkus-workflow.js';
import {ciAngularWorkflowFileName} from './workflows/ci-angular-workflow.js';
import {ciQuarkusNoChangeWorkflowFileName} from './workflows/ci-quarkus-no-change-workflow.js';
import {ciAngularNoChangeWorkflowFileName} from './workflows/ci-angular-no-change-workflow.js';
import {getDeployWorkflowFileName} from './workflows/deploy-workflow.js';

const createQuarkusReadmeSection = (newAppIssue: ReadonlyDeep<NewAppIssue>) => `
## ${quarkusStubName.toUpperCase()}

The folder \`${quarkusStubName}\` contains a [Quarkus](https://quarkus.io) application.
In the [${quarkusStubName}/README.md](${quarkusStubName}/README.md) you will find instructions on how to run and develop
locally.

The [ci-${quarkusStubName}](${repoUrl(newAppIssue.appSpec?.name)}/actions/workflows/ci-${quarkusStubName}.yaml) workflow builds the application and deploys it to UNITY.

### URLs

Here are the URLs for the environments:

* [https://unity-int.bmwgroup.net/${newAppIssue.appSpec?.name}/${quarkusStubName}/](https://unity-int.bmwgroup.net/${newAppIssue.appSpec?.name}/${quarkusStubName}/)
  * [Swagger UI](https://unity-int.bmwgroup.net/${newAppIssue.appSpec?.name}/${quarkusStubName}/swagger-ui/)
* [https://unity.bmwgroup.net/${newAppIssue.appSpec?.name}/${quarkusStubName}/](https://unity.bmwgroup.net/${newAppIssue.appSpec?.name}/${quarkusStubName}/)
  * [Swagger UI](https://unity.bmwgroup.net/${newAppIssue.appSpec?.name}/${quarkusStubName}/swagger-ui/)
`;

const createAngularReadmeSection = (newAppIssue: ReadonlyDeep<NewAppIssue>) => `
## ${angularStubName.toUpperCase()}

The folder \`${angularStubName}\` contains an [Angular](https://angular.io) application.
In the [${angularStubName}/README.md](${angularStubName}/README.md) you will find instructions on how to run and develop
locally.
[\`@bmw-ds/components\`](http://density.bmwgroup.net) are already added to the dependencies.

The [ci-${angularStubName}](${repoUrl(newAppIssue.appSpec?.name)}/actions/workflows/ci-${angularStubName}.yaml) workflow builds the application and deploys it to UNITY.

### URLs

Here are the URLs for the environments:

* [https://unity-int.bmwgroup.net/${newAppIssue.appSpec?.name}/${angularStubName}/](https://unity-int.bmwgroup.net/${newAppIssue.appSpec?.name}/${angularStubName}/)
* [https://unity.bmwgroup.net/${newAppIssue.appSpec?.name}/${angularStubName}/](https://unity.bmwgroup.net/${newAppIssue.appSpec?.name}/${angularStubName}/)
`;


const createBadge = (appName: string | undefined, workflowName: string, workflowPath = 'actions/workflows/') => {
  const url = `${repoUrl(appName)}/${workflowPath}${workflowName}`;
  return `[![${workflowName}](${url}/badge.svg)](${url})`;
};

export const createReadme = (newAppIssue: ReadonlyDeep<NewAppIssue>) => `
# ${newAppIssue.appSpec?.name}

${createBadge(newAppIssue.appSpec?.name, getDeployWorkflowFileName(appEnvironments.int))}
${createBadge(newAppIssue.appSpec?.name, getDeployWorkflowFileName(appEnvironments.prod))}
${createBadge(newAppIssue.appSpec?.name, rolloutToProdWorkflowFileName)}
${createBadge(newAppIssue.appSpec?.name, `dependabot-version-updates`, 'actions/workflows/dependabot/')}
${newAppIssue.generateQuarkusStub ? createBadge(newAppIssue.appSpec?.name, ciQuarkusWorkflowFileName) : ''}
${newAppIssue.generateQuarkusStub ? createBadge(newAppIssue.appSpec?.name, ciQuarkusNoChangeWorkflowFileName) : ''}
${newAppIssue.generateAngularStub ? createBadge(newAppIssue.appSpec?.name, ciAngularWorkflowFileName) : ''}
${newAppIssue.generateAngularStub ? createBadge(newAppIssue.appSpec?.name, ciAngularNoChangeWorkflowFileName) : ''}

## Configuration

A UNITY app is configured via one [YAML](https://yaml.org) file per environment.

 * [unity-app.int.yaml](./unity-app.int.yaml) is the configuration that should be deployed on the int stage.
 * [unity-app.prod.yaml](./unity-app.prod.yaml) is the configuration that should be deployed on the prod stage.

Usually, these configurations differ in the image tags of your app versions.

Logs (and Metrics) can be found in Grafana:
 * [Grafana (int)](https://unity-int.bmwgroup.net/grafana/explore?left=%7B%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22expr%22%3A%22%7Bapp%3D%5C%22${repoName(newAppIssue.appSpec?.name)}%5C%22%7D%22%7D%5D%7D)
 * [Grafana (prod)](https://unity.bmwgroup.net/grafana/explore?left=%7B%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22expr%22%3A%22%7Bapp%3D%5C%22${repoName(newAppIssue.appSpec?.name)}%5C%22%7D%22%7D%5D%7D)

Read more about it in the
[Telemetry](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/app-dev-handbook/telemetry.html)
section of the AppDev Handbook.


${newAppIssue.generateQuarkusStub ? createQuarkusReadmeSection(newAppIssue) : ''}
${newAppIssue.generateAngularStub ? createAngularReadmeSection(newAppIssue) : ''}
`.trim();

