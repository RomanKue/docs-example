import {containerRegistry, unityOrg} from '../../../config.js';
import {ciAction} from './index.js';

export const createCiAngularWorkflow = (name: string) => `
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
      - uses: actions/setup-node@v3
        with:
          node-version: "16"
          cache: npm
          cache-dependency-path: \${{ env.DEPLOYMENT }}/package-lock.json
      - name: ci
        working-directory: \${{ env.DEPLOYMENT }}
        run: npm ci
      - name: test
        working-directory: \${{ env.DEPLOYMENT }}
        run: npx ng test
      - name: build
        working-directory: \${{ env.DEPLOYMENT }}
        run: npx ng build -c production
      - name: build image
        working-directory: \${{ env.DEPLOYMENT }}
        env:
            REGISTRY: ${containerRegistry}
            REGISTRY_PASSWORD: \${{ secrets.GITHUB_TOKEN }}
            IMAGE_GROUP: ${unityOrg.toLowerCase()}
            IMAGE_NAME: \${{ github.event.repository.name }}-\${{ env.DEPLOYMENT }}
            IMAGE_TAG: latest
        run: |
            echo "
            FROM nginxinc/nginx-unprivileged:latest
            LABEL org.opencontainers.image.source \${{ github.event.repository.html_url }}
            COPY dist/\${{ env.DEPLOYMENT }} /usr/share/nginx/html
            " > docker build -t \${{ env.IMAGE_GROUP }}/\${{ env.IMAGE_NAME }}:\${{ env.IMAGE_TAG }} -
            echo \${{ env.REGISTRY_PASSWORD }} | docker login \${{ env.REGISTRY }} -u USERNAME --password-stdin
            docker push -t \${{ env.IMAGE_GROUP }}/\${{ env.IMAGE_NAME }}:\${{ env.IMAGE_TAG }}
    `.trim();

