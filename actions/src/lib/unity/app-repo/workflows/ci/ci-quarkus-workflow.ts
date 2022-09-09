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
    timeout-minutes: 30
    permissions:
      contents: read
      id-token: write
      packages: write
    steps:
      - uses: actions/checkout@v3
      - name: setup java
        uses: actions/setup-java@v3
        with:
          distribution: "zulu"
          java-version: "17"
          cache: maven
      - name: setup maven
        uses: pmd/setup-maven@v1
      - name: build image
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
          QUARKUS_CONTAINER_IMAGE_PUSH: "true"
        run: mvn clean package
    `.trim();

