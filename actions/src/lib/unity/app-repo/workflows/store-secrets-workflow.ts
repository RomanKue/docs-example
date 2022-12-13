export const storeSecretsWorkflowFileName = 'store-secrets.yaml';
export const storeSecretsWorkflowName = 'store-secrets';

export const createStoreSecretsWorkflow = () => `
name: ${storeSecretsWorkflowName}
on:
  workflow_dispatch:
    inputs:
      environment:
        required: true
        description: environment of the secrets to get
        type: choice
        options:
          - int
          - prod
jobs:
  ${storeSecretsWorkflowName}:
    runs-on: atc-ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      - name: write secrets
        shell: bash
        env:
          KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
        run: echo "\${{ format('KUBERNETES_TOKEN{0} $KUBERNETES_TOKEN', ':') }}" >> secrets.yaml
      - name: upload secrets
        uses: actions/upload-artifact@v3
        with:
          name: secrets.yaml
          path: secrets.yaml
    `.trim();

