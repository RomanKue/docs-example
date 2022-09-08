export const makeStubWorkflowFileName = 'make-stub.yaml';
export const makeStubAction = 'make-stub';

export const createMakeStubWorkflow = () => `
name: ${makeStubWorkflowFileName}
on:
  workflow_dispatch:
    inputs:
      name:
        description: 'the name of the deployable'
        required: true
        type: string
      type:
        description: the type of stub to create
        required: true
        type: choice
        options:
          - angular
          - quarkus
      branch:
        description: 'the branch where the app should be created'
        required: true
        default: 'main'
        type: string
jobs:
  make-stub:
    permissions:
      contents: write
      id-token: write
    runs-on: atc-ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.branch }}
      - uses: unity/${makeStubAction}@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          name: \${{ inputs.name }}
          type: \${{ inputs.type }}
          branch: \${{ inputs.branch }}
    `;

