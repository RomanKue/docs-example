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
      password:
        required: true
        description: The password to protect the secrets. It must contain 16 characters at least
        type: string
jobs:
  ${storeSecretsWorkflowName}:
    runs-on: atc-ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      - name: mask password
        shell: bash
        run: |
          PASSWORD=$(jq -r '.inputs.password' $GITHUB_EVENT_PATH)
          echo "::add-mask::$PASSWORD"
      - uses: unity/gh-secrets-to-kee-pass@v1
        with:
          password: \${{ inputs.password }}
          secrets: \${{ toJson(secrets) }}
    `.trim();

