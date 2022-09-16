export const deployAppWorkflowFileName = 'deploy.yaml';
export const deployAppAction = 'deploy-unity-app';

export const createDeployWorkflow = () => `
name: ${deployAppAction}
on:
  workflow_dispatch:
    inputs:
      environment:
        required: true
        description: environment to deploy to
        type: choice
        options:
          - int
          - prod
  workflow_call:
    inputs:
      environment:
        required: true
        description: environment to deploy to
        type: string
concurrency:
  group: ${deployAppAction}
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
        with:
          environment: \${{ github.event.inputs.environment }}
    `.trim();

