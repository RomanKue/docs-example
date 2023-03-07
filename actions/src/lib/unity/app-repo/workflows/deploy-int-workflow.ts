import {configChangeIntWorkflowName} from './config-change-int-workflow.js';
import {ciApiWorkflowName} from './ci-api-workflow.js';
import {ciUiWorkflowName} from './ci-ui-workflow.js';
import {NewAppIssue} from '../../issues/new-app/new-app-issue.js';

export const deployIntWorkflowFileName = 'deploy-int.yaml';
export const deployAppIntWorkflowName = 'deploy-unity-app-int';

export const createDeployIntWorkflow = (newAppIssue: NewAppIssue) => `
name: ${deployAppIntWorkflowName}
on:
  workflow_dispatch:
  workflow_run:
    workflows:
      - ${configChangeIntWorkflowName}
      ${newAppIssue.generateQuarkusStub ? `- ${ciApiWorkflowName}` : ''}
      ${newAppIssue.generateAngularStub ? `- ${ciUiWorkflowName}` : ''}
    types:
      - completed
    branches:
      - main
concurrency:
  group: ${deployAppIntWorkflowName}
jobs:
  ${deployAppIntWorkflowName}:
    if: \${{ github.event.workflow_run.conclusion == 'success' && github.actor != 'dependabot[bot]' }}
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    environment: int
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - uses: unity/deploy-unity-app@main
        with:
          environment: int
          KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
          KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
          KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
    `.trim();

