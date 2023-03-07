import {configChangeProdWorkflowName} from './config-change-prod-workflow.js';
import {ciUiWorkflowName} from './ci-ui-workflow.js';
import {ciApiWorkflowName} from './ci-api-workflow.js';
import {NewAppIssue} from '../../issues/new-app/new-app-issue.js';

export const deployProdWorkflowFileName = 'deploy-prod.yaml';
export const deployAppProdWorkflowName = 'deploy-unity-app-prod';

export const createDeployProdWorkflow = (newAppIssue: NewAppIssue) => `
name: ${deployAppProdWorkflowName}
on:
  workflow_dispatch:
  workflow_run:
    workflows:
      - ${configChangeProdWorkflowName}
      ${newAppIssue.generateQuarkusStub ? `- ${ciApiWorkflowName}` : ''}
      ${newAppIssue.generateAngularStub ? `- ${ciUiWorkflowName}` : ''}
    types:
      - completed
    branches:
      - main
concurrency:
  group: ${deployAppProdWorkflowName}
jobs:
  ${deployAppProdWorkflowName}:
    if: \${{ github.event.workflow_run.conclusion == 'success' && github.actor != 'dependabot[bot]' }}
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    environment: prod
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - uses: unity/deploy-unity-app@main
        with:
          environment: prod
          KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
          KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
          KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
    `.trim();

