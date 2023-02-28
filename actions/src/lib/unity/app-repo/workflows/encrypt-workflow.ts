import {ReadonlyDeep} from 'type-fest';
import {NewAppIssue} from '../../issues/new-app/new-app-issue.js';
import {angularStubName, quarkusStubName} from '../../config.js';
import {trimEmptyLines} from '../../../strings/whitespace.js';

export const encryptWorkflowFileName = 'encrypt.yaml';
export const encryptWorkflowName = 'encrypt';

const createSetStatusStep = (jobName: string) => trimEmptyLines(`
      - name: ${jobName}
        if: always()
        run: >
          curl "\${{ github.api_url }}/repos/\${{ github.repository }}/statuses/\${{ env.GIT_SHA }}"
          -H "Authorization: token \${{ secrets.GITHUB_TOKEN }}"
          -H "Accept: application/vnd.github+json"
          -d '{"state":"\${{ job.status == 'success' && 'success' || 'failure' }}","context":"${jobName}"}'
`).trim();

const createForQuarkus = () => createSetStatusStep(`ci-${quarkusStubName}`);
const createForAngular = () => createSetStatusStep(`ci-${angularStubName}`);

export const createEncryptWorkflow = (newAppIssue: ReadonlyDeep<Pick<NewAppIssue, 'generateAngularStub' | 'generateQuarkusStub'>>) => `
name: ${encryptWorkflowName}
on:
  workflow_dispatch:
    inputs:
      environment:
        required: true
        description: environment
        type: choice
        options:
          - int
          - prod
      yaml-path:
        required: true
        description: path of the yaml property to patch with the encrypted value
        type: string
        default: deployments.api.container.secretEnv.FOO.value
      secret:
        required: true
        description: secret value to encrypt
        type: string
      branch:
        required: true
        description: branch to commit changes to
        type: string
        default: secret
jobs:
  ${encryptWorkflowName}:
    env:
      FILE: unity-app.\${{ inputs.environment }}.yaml
    permissions:
      actions: write
      contents: write
      id-token: write
      pull-requests: write
      statuses: write
    runs-on: atc-ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - name: add mask
        shell: bash
        run: |
          SECRET=$(jq -r '.inputs.secret' $GITHUB_EVENT_PATH)
          echo "::add-mask::$SECRET"
      - uses: actions/checkout@v3
      - uses: unity/setup-git@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      - name: create branch
        run: |
          git fetch --all
          git switch "\${{ inputs.branch }}" || git switch -c "\${{ inputs.branch }}"
      - name: helm-crypt
        uses: unity/helm-crypt@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          CRYPT_MASTER_KEY: \${{ secrets.CRYPT_MASTER_KEY }}
        with:
          yaml-path: \${{ inputs.yaml-path }}
          secret: \${{ inputs.secret }}
          path: \${{ env.FILE }}
      - name: commit changes
        id: git
        run: |
          git add "\${{ env.FILE }}"
          git commit -m "add secret \${{ inputs.yaml-path }}"
          git push origin "\${{ inputs.branch }}:\${{ inputs.branch }}"
          echo "GIT_SHA=$(git rev-parse \${{ inputs.branch}})" >> $GITHUB_ENV
      - name: gh login
        shell: bash
        run: >
          echo '\${{ secrets.GITHUB_TOKEN }}' | gh auth login --hostname atc-github.azure.cloud.bmw --with-token
      - name: create pull request
        continue-on-error: true # when pull request exists already, continue
        shell: bash
        run: >
          gh pr create
          --base $(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
          --head \${{ inputs.branch }}
          --assignee \${{ github.actor }}
          --reviewer \${{ github.actor }}
          --fill
      - name: enable auto merge
        run: gh pr merge --auto --merge \${{ inputs.branch }}
      ${newAppIssue.generateAngularStub ? createForAngular() : ''}
      ${newAppIssue.generateQuarkusStub ? createForQuarkus() : ''}
    `.trim();

