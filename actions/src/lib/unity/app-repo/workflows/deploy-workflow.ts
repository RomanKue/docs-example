import {ciQuarkusWorkflowName} from './ci-quarkus-workflow.js';
import {ciAngularWorkflowName} from './ci-angular-workflow.js';
import {NewAppIssue} from '../../issues/new-app/new-app-issue.js';
import {getConfigChangeWorkflowName} from './config-change-workflow.js';

export const getDeployWorkflowFileName = (environment: string) => `deploy-${environment}.yaml`;
export const getDeployWorkflowName = (environment: string) => `deploy-unity-app-${environment}`;


export const createDeployWorkflow = (newAppIssue: NewAppIssue, environment: string) => `
name: ${getDeployWorkflowName(environment)}
on:
  workflow_dispatch:
  workflow_run:
    workflows:
      - ${getConfigChangeWorkflowName(environment)}
      ${newAppIssue.generateQuarkusStub ? `- ${ciQuarkusWorkflowName}` : ''}
      ${newAppIssue.generateAngularStub ? `- ${ciAngularWorkflowName}` : ''}
    types:
      - completed
    branches:
      - main
concurrency:
  group: ${getDeployWorkflowName(environment)}
jobs:
  ${getDeployWorkflowName(environment)}:
    if: \${{ (github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success') && github.actor != 'dependabot[bot]' }}
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    environment: ${environment}
    steps:
      - uses: actions/checkout@v3
      - uses: unity/deploy-unity-app@v1
        with:
          environment: ${environment}
          KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
          KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
          KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
    `.trim();
