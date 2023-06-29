export const dependabotAutoApproveWorkflowFileName = 'dependabot-auto-approve.yaml';
export const createDependabotAutoApproveWorkflow = () => `
name: dependabot-auto-approve
on: pull_request_target

permissions:
  id-token: write
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: atc-ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          skip-commit-verification: true
      - name: gh login
        shell: bash
        run: >
          echo '\${{ secrets.GITHUB_TOKEN }}' | gh auth login --hostname atc-github.azure.cloud.bmw --with-token
      - name: Approve non-major version updates
        if: \${{ steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor' }}
        run: gh pr review --approve "$PR_URL"
        env:
          PR_URL: \${{ github.event.pull_request.html_url }}

      # The following step can merge minor and patch version upgrades automatically after a successful build
      # keep in mind, that merging a PR using GITHUB_TOKEN will not trigger any workflows on the main branch after merging.
      # Auto merge can only be enabled if "Restrict who can push to matching branches" is disabled, otherwise the step will fail with
      # "Pull request User is not authorized for this protected branch"
      # Either, keep "Restrict who can push to matching branches" disabled,
      # use a technical user's PAT instead of the GITHUB_TOKEN,
      # or remove that step from the workflow and handle it manually.

      # - name: Enable auto merge
      #   run: gh pr merge --auto --merge "$PR_URL"
      #   env:
      #     PR_URL: \${{ github.event.pull_request.html_url }}

    `.trim();
