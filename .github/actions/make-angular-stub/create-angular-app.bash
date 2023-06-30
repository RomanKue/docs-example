#!/usr/bin/env bash

set -xeu pipefail

echo "ORG=$ORG"
echo "NAME=$NAME"
echo "ANGULAR_VERSION=$ANGULAR_VERSION"
REPO_PATH=$(git rev-parse --show-toplevel)
REPO=$(basename "$REPO_PATH")
export REPO
APP_NAME=${REPO#"app-"}
export APP_NAME

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)

pwd
ls -lah

npm install --location=global gomplate
npm install --location=global @angular/cli@$ANGULAR_VERSION
ng new "$NAME" --defaults --style=scss --skip-git

(
  cd "$NAME"
  npx ng analytics off

  # increase budget size to be able to built with design system
  npx ng config "projects.$NAME.architect.build.configurations.production.budgets[0].maximumWarning" 5mb
  npx ng config "projects.$NAME.architect.build.configurations.production.budgets[0].maximumError" 5mb

  # set base href
  npx ng config "projects.$NAME.architect.build.options.baseHref" "/$APP_NAME/$NAME/"

  # design system, see https://density.bmwgroup.net/v7/guides/setup/getting-started
  npm config set @bmw-ds:registry https://nexus.bmwgroup.net/repository/bmw_npm_repositories/
  npm install @angular/cdk@$ANGULAR_VERSION @angular/material@$ANGULAR_VERSION @bmw-ds/components@latest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  npx ng add @angular-eslint/schematics --skip-confirmation

  echo "@import '../node_modules/@bmw-ds/components/density-styles/styles/scss/density-styles-ng.scss';" > src/styles.scss

  < "$SCRIPT_PATH/templates/app.module.ts" gomplate > "src/app/app.module.ts"

  mkdir -p src/app/interceptors

  < "$SCRIPT_PATH/templates/authentication-error-interceptor.ts" gomplate > "src/app/interceptors/authentication-error-interceptor.ts"

  # bootstrap density after instantiating the templates
  npx ng add @bmw-ds/components --defaults
  < "$SCRIPT_PATH/templates/app.component.ts" gomplate > "src/app/app.component.ts"
  < "$SCRIPT_PATH/templates/index.html" gomplate > "src/index.html"
  < "$SCRIPT_PATH/templates/app.component.html" gomplate > "src/app/app.component.html"
  < "$SCRIPT_PATH/templates/app.component.scss" gomplate > "src/app/app.component.scss"
  # Remove density background-image
  < "$SCRIPT_PATH/templates/styles.scss" gomplate > "src/styles.scss"

  # add images
  mkdir -p src/assets/images
  < "$SCRIPT_PATH/templates/Logo-unity.svg" gomplate > "src/assets/images/Logo-unity.svg"
  < "$SCRIPT_PATH/templates/unity-skeleton.svg" gomplate > "src/assets/images/unity-skeleton.svg"

  mkdir -p src/assets/images/favicon
  < "$SCRIPT_PATH/templates/favicon.ico" gomplate > "src/assets/images/favicon/favicon.ico"
  < "$SCRIPT_PATH/templates/logo.svg" gomplate > "src/assets/images/favicon/logo.svg"
  < "$SCRIPT_PATH/templates/logo_16x16.png" gomplate > "src/assets/images/favicon/logo_16x16.png"
  < "$SCRIPT_PATH/templates/logo_32x32.png" gomplate > "src/assets/images/favicon/logo_32x32.png"
  < "$SCRIPT_PATH/templates/logo_180x180.png" gomplate > "src/assets/images/favicon/logo_180x180.png"

  < "$SCRIPT_PATH/templates/app.component.spec.ts" gomplate > "src/app/app.component.spec.ts"

  # add Dockerfile and nginx config
  < "$SCRIPT_PATH/templates/Dockerfile" gomplate > "Dockerfile"
  < "$SCRIPT_PATH/templates/nginx.conf" gomplate > "nginx.conf"

  # list what has been created
  ls -lah
)
