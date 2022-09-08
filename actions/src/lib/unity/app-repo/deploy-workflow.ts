export const deployAppWorkflowFileName = 'deploy.yaml';
export const deployAppAction = 'deploy-unity-app';

export const createDeployWorkflow = () => `
name: ${deployAppAction}
on:
  push:
    branches:
      - int
      - prod
jobs:
  ${deployAppAction}:
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v3
      - uses: unity/${deployAppAction}@v1
    `;

