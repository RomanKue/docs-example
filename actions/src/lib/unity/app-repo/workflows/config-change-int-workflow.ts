import {ReadonlyDeep} from 'type-fest';
import {AppSpec} from '../../app-spec.js';
import {deployIntWorkflowFileName} from './deploy-int-workflow.js';

export const configChangeIntWorkflowFileName = 'config-change-int.yaml';
export const configChangeIntWorkflowName = 'config-change-int';

export const createConfigChangeIntWorkflow = (appSpec: ReadonlyDeep<AppSpec>) => `
name: ${configChangeIntWorkflowName}
on:
  push:
    branches:
      - main
    paths:
      - .github/workflows/${configChangeIntWorkflowFileName}
      - .github/workflows/${deployIntWorkflowFileName}
      - unity-app.int.yaml
jobs:
  ${configChangeIntWorkflowName}:
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - run: |
          echo "config change in: unity-app.int.yaml"
    `.trim();

