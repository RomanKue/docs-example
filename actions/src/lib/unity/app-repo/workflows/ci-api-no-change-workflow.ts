import {quarkusStubName} from '../../config.js';
import {ciApiWorkflowFileName, ciApiWorkflowName} from './ci-api-workflow.js';

export const ciApiNoChangeWorkflowFileName = `ci-${quarkusStubName}-no-change.yaml`;
export const ciApiNoChangeWorkflowName = `ci-${quarkusStubName}-no-change`;

export const createCiApiNoChangeWorkflow = () => `
name: ${ciApiNoChangeWorkflowName}
on:
  pull_request:
    paths-ignore:
      - .github/workflows/${ciApiWorkflowFileName}
      - ${quarkusStubName}/**
jobs:
  ${ciApiWorkflowName}:
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

