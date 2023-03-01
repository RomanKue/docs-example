import {ReadonlyDeep} from 'type-fest';
import {AppSpec, repoName} from '../../app-spec.js';
import {deployAppWorkflowFileName} from './deploy-workflow.js';

export const configChangeWorkflowFileName = 'config-change.yaml';
export const configChangeWorkflowName = 'config-change';

export const createConfigChangeWorkflow = (appSpec: ReadonlyDeep<AppSpec>) => `
name: ${configChangeWorkflowName}
on:
  push:
    branches:
      - main
jobs:
  config-int:
    outputs:
      cache-hit: \${{ steps.cache.outputs.cache-hit }}
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v3
      - name: cache
        id: cache
        uses: actions/cache@v3
        with:
          key: ${configChangeWorkflowName}-\${{ hashFiles( 'unity-app.int.yaml', '.github/workflows/**' ) }}
          path: unity-app.int.yaml
  config-prod:
    outputs:
      cache-hit: \${{ steps.cache.outputs.cache-hit }}
    runs-on: atc-ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v3
      - name: cache
        id: cache
        uses: actions/cache@v3
        with:
          key: ${configChangeWorkflowName}-\${{ hashFiles( 'unity-app.prod.yaml', '.github/workflows/**' ) }}
          path: unity-app.prod.yaml
  deploy-int:
    needs:
      - config-int
    if: \${{ needs.config-int.outputs.cache-hit != 'true' }}
    uses: UNITY/${repoName(appSpec.name)}/.github/workflows/${deployAppWorkflowFileName}@main
    with:
      environment: int
    secrets:
      CRYPT_MASTER_KEY: \${{ secrets.CRYPT_MASTER_KEY }}
      KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
      KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
      KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
  deploy-prod:
    needs:
      - config-prod
    if: \${{ needs.config-prod.outputs.cache-hit != 'true' }}
    uses: UNITY/${repoName(appSpec.name)}/.github/workflows/${deployAppWorkflowFileName}@main
    with:
      environment: prod
    secrets:
      CRYPT_MASTER_KEY: \${{ secrets.CRYPT_MASTER_KEY }}
      KUBERNETES_TOKEN: \${{ secrets.KUBERNETES_TOKEN }}
      KUBERNETES_HOST: \${{ secrets.KUBERNETES_HOST }}
      KUBERNETES_NAMESPACE: \${{ secrets.KUBERNETES_NAMESPACE }}
    `.trim();

