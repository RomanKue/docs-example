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
  npm install @angular/cdk@$ANGULAR_VERSION @bmw-ds/components@latest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  npx ng add @angular-eslint/schematics --skip-confirmation

  echo "@import '../node_modules/@bmw-ds/components/density-styles/styles/scss/density-styles-ng.scss';" > src/styles.scss

  < "$SCRIPT_PATH/templates/app.module.ts" gomplate > "src/app/app.module.ts"

  mkdir -p src/app/interceptors

  < "$SCRIPT_PATH/templates/authentication-error-interceptor.ts" gomplate > "src/app/interceptors/authentication-error-interceptor.ts"

  # bootstrap density after instantiating the templates
  npx ng add @bmw-ds/components --defaults
  < "$SCRIPT_PATH/templates/app.component.ts" gomplate > "src/app/app.component.ts"
  < "$SCRIPT_PATH/templates/index.html" gomplate > "src/index.html"

  # fix broken generated density tests, remove when https://atc.bmwgroup.net/jira/browse/DESY-3043 is fixed
  < "$SCRIPT_PATH/templates/app.component.spec.ts" gomplate > "src/app/app.component.spec.ts"

  # list what has been created
  ls -lah
)

