import {angularStubName} from '../../config.js';
import {ciUiWorkflowFileName, ciUiWorkflowName} from './ci-ui-workflow.js';

export const ciUiNoChangeWorkflowFileName = `ci-${angularStubName}-no-change.yaml`;
export const ciUiNoChangeWorkflowName = `ci-${angularStubName}-no-change`;

export const createCiUiNoChangeWorkflow = () => `
name: ${ciUiNoChangeWorkflowName}
on:
  pull_request:
    paths-ignore:
      - .github/workflows/${ciUiWorkflowFileName}
      - ${angularStubName}/**
jobs:
  ${ciUiWorkflowName}:
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - name: report status
        run: |
          echo "no build needed"
    `.trim();

