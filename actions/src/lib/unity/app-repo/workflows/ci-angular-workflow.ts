import {ReadonlyDeep} from 'type-fest';
import {AppSpec} from '../../app-spec.js';
import {rolloutToProdWorkflowFileName} from './rollout-to-prod-workflow.js';
import {angularStubName, nodeVersion} from '../../config.js';

export const ciAngularWorkflowFileName = `ci-${angularStubName}.yaml`;
export const ciAngularWorkflowName = `ci-${angularStubName}`;

export const createCiAngularWorkflow = (appSpec: ReadonlyDeep<Pick<AppSpec, 'name'>>,) => `
name: ${ciAngularWorkflowName}
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/${ciAngularWorkflowFileName}
      - .github/workflows/${rolloutToProdWorkflowFileName}
      - ${angularStubName}/**
    branches:
      - main
  pull_request:
    paths:
      - .github/workflows/${ciAngularWorkflowFileName}
      - .github/workflows/${rolloutToProdWorkflowFileName}
      - ${angularStubName}/**

env:
  DEPLOYMENT: ${angularStubName}
  REGISTRY: containers.atc-github.azure.cloud.bmw
jobs:
  ${ciAngularWorkflowName}:
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
      - uses: actions/setup-node@v3
        with:
          node-version: "${nodeVersion}"
          cache: npm
          cache-dependency-path: \${{ env.DEPLOYMENT }}/package-lock.json
      - name: ci
        working-directory: \${{ env.DEPLOYMENT }}
        run: npm ci --force
      - name: build
        working-directory: \${{ env.DEPLOYMENT }}
        run: npx ng build -c production
      - name: install chromium
        run: |
          sudo apt-get update
          sudo apt install chromium-browser
      - name: test
        working-directory: \${{ env.DEPLOYMENT }}
        env:
          CHROME_BIN: /usr/bin/chromium-browser
        run: npx ng test --browsers=ChromeHeadless --watch=false
      - name: lint
        working-directory: \${{ env.DEPLOYMENT }}
        run: npx ng lint
      - name: docker login
        if: \${{ github.ref == 'refs/heads/main' }}
        uses: docker/login-action@v2
        with:
          registry: \${{ env.REGISTRY }}
          username: USERNAME
          password: \${{ secrets.GITHUB_TOKEN }}
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
      - name: set image
        shell: bash
        run: |
          echo "IMAGE=\${{ env.REGISTRY }}/\${{ env.IMAGE_GROUP }}/\${{ env.IMAGE_NAME }}:\${{ env.TAG }}" >> $GITHUB_ENV
          echo "MOVING_IMAGE=\${{ env.REGISTRY }}/\${{ env.IMAGE_GROUP }}/\${{ env.IMAGE_NAME }}:\${{ env.MOVING_TAG }}" >> $GITHUB_ENV
      - name: build image
        working-directory: \${{ env.DEPLOYMENT }}
        run: |
          echo '
          server {
            listen       8080;
            server_name  localhost;

            location / {
              root   /usr/share/nginx/html;
              index  index.html index.htm;
              try_files $uri $uri/ /index.html?$args;
            }

            error_page   500 502 503 504  /50x.html;
            location = /50x.html {
              root   /usr/share/nginx/html;
            }
          }
          ' > default.conf
          echo "
          FROM nginxinc/nginx-unprivileged:alpine-slim
          LABEL org.opencontainers.image.source \${{ github.event.repository.html_url }}
          COPY default.conf /etc/nginx/conf.d/
          COPY dist/\${{ env.DEPLOYMENT }}/ /usr/share/nginx/html/${appSpec.name}/\${{ env.DEPLOYMENT }}
          " > Dockerfile
          docker build -t \${{ env.IMAGE }} -t \${{ env.MOVING_IMAGE }} .
      - name: push image
        if: \${{ github.ref == 'refs/heads/main' }}
        working-directory: \${{ env.DEPLOYMENT }}
        run: |
          docker push \${{ env.IMAGE }}
          docker push \${{ env.MOVING_IMAGE }}
      - name: output image tag
        if: \${{ github.ref == 'refs/heads/main' }}
        id: image-tag
        run: echo "::set-output name=image-tag::\${{ env.TAG }}"
  rollout-to-prod:
    needs:
      - ${ciAngularWorkflowName}
    if: \${{ github.ref == 'refs/heads/main' }}
    uses: ./.github/workflows/rollout-to-prod.yaml
    with:
      tag: \${{ needs.${ciAngularWorkflowName}.outputs.image-tag }}
      unity-app-file: unity-app.prod.yaml
      yaml-path: .deployments.${angularStubName}.container.tag
      branch: rollout-to-prod
      auto-merge: false
    `.trim();

