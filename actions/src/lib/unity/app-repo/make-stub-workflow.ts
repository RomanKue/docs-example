export const makeStubWorkflowFileName = 'make-stub.yaml';
export const makeStubAction = 'make-stub';

export const createMakeStubWorkflow = () => `
name: ${makeStubAction}
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
        description: 'branch which the stub should be pushed to'
        required: true
        default: 'main'
        type: string
      ref:
        description: 'the ref (branch or tag) where the app should be created from'
        required: true
        default: 'main'
        type: string
jobs:
  ${makeStubAction}:
    permissions:
      contents: write
      id-token: write
    concurrency:
      # don't make two stubs in parallel
      group: ${makeStubAction}
      cancel-in-progress: false
    runs-on: atc-ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ github.event.inputs.ref }}
      - uses: unity/${makeStubAction}@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          name: \${{ github.event.inputs.name }}
          type: \${{ github.event.inputs.type }}
          branch: \${{ github.event.inputs.branch }}
          ref: \${{ github.event.inputs.ref }}
    `;

