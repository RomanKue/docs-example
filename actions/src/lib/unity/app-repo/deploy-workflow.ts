export const deployAppWorkflowFileName = 'deploy.yaml';
export const deployAppAction = 'deploy-unity-app';

export const createDeployWorkflow = () => `
name: deploy
on:
  push:
    branches:
      - int
      - prod
jobs:
  deploy:
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v3
      - uses: unity/${deployAppAction}@v1
    `;

