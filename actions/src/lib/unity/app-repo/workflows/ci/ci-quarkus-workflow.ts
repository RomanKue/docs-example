import {containerRegistry, unityOrg} from '../../../config.js';
import {ciAction} from './index.js';


export const createCiQuarkusWorkflow = (name: string) => `
name: ${ciAction}-${name}
on:
  push:
    branches:
      - main
env:
  DEPLOYMENT: ${name}
jobs:
  ${ciAction}-${name}:
    runs-on: atc-ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
      id-token: write
      packages: write
    steps:
      - uses: actions/checkout@v3
      - name: cache
        id: cache
        uses: actions/cache@v3
        with:
          # don't rebuild all the time if nothing relevant changes
          key: ci-\${{ env.DEPLOYMENT }}-\${{ hashFiles( format('{0}/**', env.DEPLOYMENT ), '.github/workflows/**' ) }}
          path: \${{ env.DEPLOYMENT }}
      - name: setup java
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        uses: actions/setup-java@v3
        with:
          distribution: "zulu"
          java-version: "17"
          cache: maven
      - name: setup maven
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        uses: pmd/setup-maven@v1
      - name: build image
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        working-directory: \${{ env.DEPLOYMENT }}
        # see https://quarkus.io/guides/container-image#container-image-options
        env:
          QUARKUS_CONTAINER_IMAGE_REGISTRY: ${containerRegistry}
          QUARKUS_CONTAINER_IMAGE_USERNAME: USERNAME
          QUARKUS_CONTAINER_IMAGE_PASSWORD: \${{ secrets.GITHUB_TOKEN }}
          QUARKUS_CONTAINER_IMAGE_NAME: \${{ github.event.repository.name }}-\${{ env.DEPLOYMENT }}
          QUARKUS_CONTAINER_IMAGE_TAG: latest
          QUARKUS_CONTAINER_IMAGE_GROUP: ${unityOrg.toLowerCase()}
          QUARKUS_CONTAINER_IMAGE_BUILD: "true"
          QUARKUS_CONTAINER_IMAGE_PUSH: \${{ github.ref == 'refs/heads/main' }}
        run: mvn clean package
    `.trim();

