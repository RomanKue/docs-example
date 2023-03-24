import {AppSpec} from '../../app-spec.js';
import {ReadonlyDeep} from 'type-fest';

export const getConfigChangeWorkflowFileName = (environment: string) => `config-change-${environment}.yaml`;
export const getConfigChangeWorkflowName = (environment: string) => `config-change-${environment}`;
export const createConfigChangeWorkflow = (appSpec: ReadonlyDeep<Pick<AppSpec, 'name'>>, environment: string) => `
name: ${getConfigChangeWorkflowName(environment)}
on:
  push:
    branches:
      - main
    paths:
      - unity-app.${environment}.yaml
jobs:
  ${getConfigChangeWorkflowName(environment)}:
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - run: |
          echo "config change in: unity-app.${environment}.yaml"
    `.trim();

