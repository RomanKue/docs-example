import {ciApiWorkflowName} from './ci-api-workflow.js';
import {ciUiWorkflowName} from './ci-ui-workflow.js';
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
      ${newAppIssue.generateQuarkusStub ? `- ${ciApiWorkflowName}` : ''}
      ${newAppIssue.generateAngularStub ? `- ${ciUiWorkflowName}` : ''}
    types:
      - completed
    branches:
      - main
concurrency:
  group: ${getDeployWorkflowName(environment)}
jobs:
  ${getDeployWorkflowName(environment)}:
    if: \${{ github.event.workflow_run.conclusion == 'success' && github.actor != 'dependabot[bot]' }}
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    environment: int
    steps:
      - uses: actions/checkout@v3
      - uses: unity/deploy-unity-app@v1
        with:
          environment: int
          KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
          KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
          KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
    `.trim();
