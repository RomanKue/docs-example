import {ReadonlyDeep} from 'type-fest';
import {AppSpec} from '../../app-spec.js';
import {getDeployWorkflowFileName} from './deploy-workflow.js';

export const getConfigChangeWorkflowFileName = (environment: string) => `config-change-${environment}.yaml`;
export const getConfigChangeWorkflowName = (environment: string) => `config-change-${environment}`;
export const createConfigChangeWorkflow = (appSpec: ReadonlyDeep<AppSpec>, environment: string) => `
name: ${getConfigChangeWorkflowName(environment)}
on:
  push:
    branches:
      - main
    paths:
      - .github/workflows/${getConfigChangeWorkflowFileName(environment)}
      - .github/workflows/${getDeployWorkflowFileName(environment)}
      - unity-app.int.yaml
jobs:
  ${getConfigChangeWorkflowName(environment)}:
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - run: |
          echo "config change in: unity-app.int.yaml"
    `.trim();

