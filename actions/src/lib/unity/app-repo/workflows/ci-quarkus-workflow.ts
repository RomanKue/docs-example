import {rolloutToProdWorkflowFileName} from './rollout-to-prod-workflow.js';
import {javaDistribution, javaVersion, quarkusStubName} from '../../config.js';

export const ciQuarkusWorkflowFileName = `ci-${quarkusStubName}.yaml`;
export const ciQuarkusWorkflowName = `ci-${quarkusStubName}`;

export const createCiQuarkusWorkflow = () => `
name: ${ciQuarkusWorkflowName}
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/${ciQuarkusWorkflowFileName}
      - .github/workflows/${rolloutToProdWorkflowFileName}
      - ${quarkusStubName}/**
    branches:
      - main
  pull_request:
    paths:
      - .github/workflows/${ciQuarkusWorkflowFileName}
      - .github/workflows/${rolloutToProdWorkflowFileName}
      - ${quarkusStubName}/**

env:
  DEPLOYMENT: ${quarkusStubName}
  REGISTRY: containers.atc-github.azure.cloud.bmw
jobs:
  ${ciQuarkusWorkflowName}:
    outputs:
      image-tag: \${{ steps.image-tag.outputs.image-tag }}
    runs-on: atc-ubuntu-latest
    timeout-minutes: 20
    permissions:
      contents: read
      id-token: write
      packages: write
    steps:
      - uses: actions/checkout@v3
      - name: setup java
        uses: actions/setup-java@v3
        with:
          distribution: "${javaDistribution}"
          java-version: "${javaVersion}"
          cache: maven
      - name: setup maven
        uses: unity/setup-maven@v1
      - name: set env
        shell: bash
        run: |
          echo "TIME_STAMP=$(date -u +%Y-%m-%dT%H%M%SZ)" >> $GITHUB_ENV
          echo "GIT_SHORT_REV=$(git rev-parse --short HEAD)" >> $GITHUB_ENV
          echo "ORG=$(echo '\${{ github.repository }}' | cut -d'/' -f1 | tr '[:upper:]' '[:lower:]' )" >> $GITHUB_ENV
          echo "REPO=$(echo '\${{ github.repository }}' | cut -d'/' -f2)" >> $GITHUB_ENV
      - name: set tag
        shell: bash
        run: |
          echo "IMAGE_GROUP=unity" >> $GITHUB_ENV
          echo "IMAGE_NAME=\${{ github.event.repository.name }}-\${{ env.DEPLOYMENT }}" >> $GITHUB_ENV
          echo "TAG=\${{ env.TIME_STAMP }}-\${{ env.GIT_SHORT_REV }}" >> $GITHUB_ENV
          echo "MOVING_TAG=latest" >> $GITHUB_ENV
      - name: build
        working-directory: \${{ env.DEPLOYMENT }}
        # see https://quarkus.io/guides/container-image#container-image-options
        env:
          QUARKUS_CONTAINER_IMAGE_REGISTRY: \${{ env.REGISTRY }}
          QUARKUS_CONTAINER_IMAGE_USERNAME: USERNAME
          QUARKUS_CONTAINER_IMAGE_PASSWORD: \${{ secrets.GITHUB_TOKEN }}
          QUARKUS_CONTAINER_IMAGE_NAME: \${{ github.event.repository.name }}-\${{ env.DEPLOYMENT }}
          QUARKUS_CONTAINER_IMAGE_TAG: \${{ env.TAG }}
          QUARKUS_CONTAINER_IMAGE_ADDITIONAL_TAGS: \${{ env.MOVING_TAG }}
          QUARKUS_CONTAINER_IMAGE_GROUP: unity
          QUARKUS_CONTAINER_IMAGE_BUILD: "true"
          QUARKUS_CONTAINER_IMAGE_PUSH: \${{ github.ref == 'refs/heads/main' }}
        run: mvn --batch-mode clean package
      - name: output image tag
        if: \${{ github.ref == 'refs/heads/main' }}
        id: image-tag
        run: echo "::set-output name=image-tag::\${{ env.TAG }}"
  rollout-to-prod:
    needs:
      - ${ciQuarkusWorkflowName}
    if: \${{ github.ref == 'refs/heads/main' }}
    uses: ./.github/workflows/rollout-to-prod.yaml
    with:
      tag: \${{ needs.${ciQuarkusWorkflowName}.outputs.image-tag }}
      unity-app-file: unity-app.prod.yaml
      yaml-path: .deployments.${quarkusStubName}.container.tag
      branch: rollout-to-prod
      auto-merge: false
    `.trim();

