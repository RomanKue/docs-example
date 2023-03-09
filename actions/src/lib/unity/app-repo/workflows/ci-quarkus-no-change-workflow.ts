import {quarkusStubName} from '../../config.js';
import {ciQuarkusWorkflowFileName, ciQuarkusWorkflowName} from './ci-quarkus-workflow.js';

export const ciQuarkusNoChangeWorkflowFileName = `ci-${quarkusStubName}-no-change.yaml`;
export const ciQuarkusNoChangeWorkflowName = `ci-${quarkusStubName}-no-change`;

export const createCiQuarkusNoChangeWorkflow = () => `
name: ${ciQuarkusNoChangeWorkflowName}
on:
  pull_request:
    paths-ignore:
      - .github/workflows/${ciQuarkusWorkflowFileName}
      - ${quarkusStubName}/**
jobs:
  ${ciQuarkusWorkflowName}:
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

