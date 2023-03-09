import {NewAppIssue} from '../../issues/new-app/new-app-issue.js';
import {ciAngularWorkflowName} from './ci-angular-workflow.js';
import {ciQuarkusWorkflowName} from './ci-quarkus-workflow.js';

export const rolloutToProdWorkflowFileName = 'rollout-to-prod.yaml';
export const rolloutToProdWorkflowName = 'rollout-to-prod';

export const createRolloutToProdWorkflow = (newAppIssue: NewAppIssue) => `
name: ${rolloutToProdWorkflowName}
on:
  workflow_call:
    inputs:
      tag:
        description: the tag of the image to deploy
        required: true
        type: string
      unity-app-file:
        description: unity-app.*.yaml file name
        required: true
        type: string
      yaml-path:
        description: the path to the tag in the unity-app.*.yaml file (which needs to be patched)
        required: true
        type: string
      branch:
        description: branch which will be updated. A pull request will be created to main with the proposed changes, automatically.
        required: true
        type: string
      auto-merge:
        description: enable auto merge for the pull request (makes sense if changes in the repository require approvals)
        required: true
        type: boolean
jobs:
  ${rolloutToProdWorkflowName}:
    runs-on: atc-ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      statuses: write
    steps:
      - uses: actions/checkout@v3
      - uses: unity/setup-yq@v1
      - uses: unity/setup-git@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      - name: create branch
        shell: bash
        run: |
          git fetch --all
          git switch "\${{ inputs.branch }}" || git switch -c "\${{ inputs.branch }}"
      - name: patch yaml
        id: patch_yaml
        shell: bash
        run: |
          yp '\${{ inputs.yaml-path }} |= "\${{ inputs.tag }}"' "\${{ inputs.unity-app-file }}"
          git add "\${{ inputs.unity-app-file }}"
          git commit -m "change image tag to \${{ inputs.tag }}"
          git push origin "\${{ inputs.branch }}:\${{ inputs.branch }}"
          echo "::set-output name=GIT_SHA::$(git rev-parse \${{ inputs.branch }})"
      - name: gh login
        shell: bash
        run: >
          echo '\${{ secrets.GITHUB_TOKEN }}' | gh auth login --hostname atc-github.azure.cloud.bmw --with-token
      - name: create-pr
        continue-on-error: true # when pull request exists already, continue
        shell: bash
        run: >
          gh pr create
          --base main
          --head \${{ inputs.branch }}
          --assignee \${{ github.actor }}
          --reviewer \${{ github.actor }}
          --title "Rollout to prod"
          --fill
      ${newAppIssue.generateAngularStub ? `
      - name: ${ciAngularWorkflowName}
        shell: bash
        run: >
          curl "\${{ github.api_url }}/repos/\${{ github.repository }}/statuses/\${{ steps.patch_yaml.outputs.GIT_SHA }}"
          -H "Authorization: token \${{ secrets.GITHUB_TOKEN }}"
          -H "Accept: application/vnd.github+json"
          -d '{"state":"\${{ job.status == 'success' && 'success' || 'failure' }}","context":"${ciAngularWorkflowName}"}'` : ''}
      ${newAppIssue.generateQuarkusStub ? `
      - name: ${ciQuarkusWorkflowName}
        shell: bash
        run: >
          curl "\${{ github.api_url }}/repos/\${{ github.repository }}/statuses/\${{ steps.patch_yaml.outputs.GIT_SHA }}"
          -H "Authorization: token \${{ secrets.GITHUB_TOKEN }}"
          -H "Accept: application/vnd.github+json"
          -d '{"state":"\${{ job.status == 'success' && 'success' || 'failure' }}","context":"${ciQuarkusWorkflowName}"}'` : ''}
      - name: enable auto-merge
        if: \${{ inputs.auto-merge == 'true' }}
        shell: bash
        run: >
          gh pr merge "\${{ inputs.branch }}" --auto --rebase
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
    `.trim();

