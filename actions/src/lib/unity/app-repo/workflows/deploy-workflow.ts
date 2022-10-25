export const deployAppWorkflowFileName = 'deploy.yaml';
export const deployAppWorkflowName = 'deploy-unity-app';

export const createDeployWorkflow = () => `
name: ${deployAppWorkflowName}
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
    secrets:
      KUBERNETES_TOKEN:
        required: true
        description: token to authenticate to a K8s cluster
      KUBERNETES_HOST:
        required: true
        description: host of the K8s cluster
      KUBERNETES_NAMESPACE:
        required: true
        description: namespace to create resources in
concurrency:
  group: ${deployAppWorkflowName}
jobs:
  ${deployAppWorkflowName}:
    permissions:
      contents: read
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    environment: \${{ inputs.environment || github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      - uses: unity/${deployAppWorkflowName}@v1
        with:
          environment: \${{ inputs.environment || github.event.inputs.environment }}
          KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
          KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
          KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
    `.trim();

