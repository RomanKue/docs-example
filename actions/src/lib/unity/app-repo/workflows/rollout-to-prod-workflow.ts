export const rolloutToProdWorkflowFileName = 'rollout-to-prod-prod.yaml';
export const rolloutToProdWorkflowName = 'rollout-to-prod';

export const createRolloutToProdWorkflow = () => `
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
      repository-projects: read # needed for view the PR for the slack https://github.com/cli/cli/issues/6274
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
          echo "\${{ inputs.tag }}"
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
          --fill
      - name: edit-pr
        shell: bash
        run: >
          gh pr edit "\${{ inputs.branch }}" --title "change image tag to \${{ inputs.tag }}"
      - name: ci-ui
        shell: bash
        run: >
          curl "\${{ github.api_url }}/repos/\${{ github.repository }}/statuses/\${{ steps.patch_yaml.outputs.GIT_SHA }}"
          -H "Authorization: token \${{ secrets.GITHUB_TOKEN }}"
          -H "Accept: application/vnd.github+json"
          -d '{"state":"\${{ job.status == 'success' && 'success' || 'failure' }}","context":"ci-ui"}'
      - name: ci-api
        shell: bash
        run: >
          curl "\${{ github.api_url }}/repos/\${{ github.repository }}/statuses/\${{ steps.patch_yaml.outputs.GIT_SHA }}"
          -H "Authorization: token \${{ secrets.GITHUB_TOKEN }}"
          -H "Accept: application/vnd.github+json"
          -d '{"state":"\${{ job.status == 'success' && 'success' || 'failure' }}","context":"ci-api"}'
      - name: enable auto-merge
        if: \${{ inputs.auto-merge == 'true' }}
        shell: bash
        run: >
          gh pr merge "\${{ inputs.branch }}" --auto --rebase
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
    `.trim();

