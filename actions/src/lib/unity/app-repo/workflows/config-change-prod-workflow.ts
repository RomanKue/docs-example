import {ReadonlyDeep} from 'type-fest';
import {AppSpec} from '../../app-spec.js';
import {deployProdWorkflowFileName} from './deploy-prod-workflow.js';

export const configChangeProdWorkflowFileName = 'config-change-prod.yaml';
export const configChangeProdWorkflowName = 'config-change-prod';

export const createConfigChangeProdWorkflow = (appSpec: ReadonlyDeep<AppSpec>) => `
name: ${configChangeProdWorkflowName}
on:
  push:
    branches:
      - main
    paths:
      - .github/workflows/${configChangeProdWorkflowFileName}
      - .github/workflows/${deployProdWorkflowFileName}
      - unity-app.prod.yaml
jobs:
  ${configChangeProdWorkflowName}:
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - run: |
          echo "config change in: unity-app.prod.yaml"
    `.trim();

