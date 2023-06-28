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
      - name: Enable auto merge
        run: gh pr merge --auto --merge "$PR_URL"
        env:
          PR_URL: \${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      # the following step can merge minor and patch version upgrades automatically after a successful build
      # - name: Approve non-major version updates
      #   if: \${{ steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor' }}
      #   run: gh pr review --approve "$PR_URL"
      #   env:
      #     PR_URL: \${{ github.event.pull_request.html_url }}

    `.trim();

