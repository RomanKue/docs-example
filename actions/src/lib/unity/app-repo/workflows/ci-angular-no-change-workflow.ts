import {angularStubName} from '../../config.js';
import {ciAngularWorkflowFileName, ciAngularWorkflowName} from './ci-angular-workflow.js';

export const ciAngularNoChangeWorkflowFileName = `ci-${angularStubName}-no-change.yaml`;
export const ciAngularNoChangeWorkflowName = `ci-${angularStubName}-no-change`;

export const createCiAngularNoChangeWorkflow = () => `
name: ${ciAngularNoChangeWorkflowName}
on:
  pull_request:
    paths-ignore:
      - .github/workflows/${ciAngularWorkflowFileName}
      - ${angularStubName}/**
jobs:
  ${ciAngularWorkflowName}:
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

