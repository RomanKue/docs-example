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
      - uses: actions/setup-node@v3
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        with:
          node-version: "16"
          cache: npm
          cache-dependency-path: \${{ env.DEPLOYMENT }}/package-lock.json
      - name: ci
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        working-directory: \${{ env.DEPLOYMENT }}
        run: npm ci
      - name: build
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        working-directory: \${{ env.DEPLOYMENT }}
        run: npx ng build -c production
      - name: install chromium
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        run: sudo apt install chromium-browser
      - name: test
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        working-directory: \${{ env.DEPLOYMENT }}
        env:
          CHROME_BIN: /usr/bin/chromium-browser
        run: npx ng test --browsers=ChromeHeadless --watch=false
      - name: docker login
        if: \${{ steps.cache.outputs.cache-hit != 'true' && github.ref == 'refs/heads/main' }}
        uses: docker/login-action@v2
        with:
          registry: containers.atc-github.azure.cloud.bmw
          username: USERNAME
          password: \${{ secrets.GITHUB_TOKEN }}
      - name: docker config
        env:
            REGISTRY: ${containerRegistry}
            REGISTRY_PASSWORD: \${{ secrets.GITHUB_TOKEN }}
            IMAGE_GROUP: ${unityOrg.toLowerCase()}
            IMAGE_NAME: \${{ github.event.repository.name }}-\${{ env.DEPLOYMENT }}
            IMAGE_TAG: latest
        run: echo "IMAGE=\${{ env.IMAGE_GROUP }}/\${{ env.IMAGE_NAME }}:\${{ env.IMAGE_TAG }}" >> $GITHUB_ENV
      - name: build image
        if: \${{ steps.cache.outputs.cache-hit != 'true' }}
        working-directory: \${{ env.DEPLOYMENT }}
        run: |
            echo "
            FROM nginxinc/nginx-unprivileged:latest
            LABEL org.opencontainers.image.source \${{ github.event.repository.html_url }}
            COPY dist/\${{ env.DEPLOYMENT }} /usr/share/nginx/html
            " > docker build -t \${{ env.IMAGE }} -
      - name: push image
        if: \${{ steps.cache.outputs.cache-hit != 'true' && github.ref == 'refs/heads/main' }}
        working-directory: \${{ env.DEPLOYMENT }}
        run: docker push \${{ env.IMAGE }}
    `.trim();
