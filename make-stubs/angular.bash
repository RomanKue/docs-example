#!/usr/bin/env bash

NAME="$1"
ANGULAR_VERSION=14

set -xeu pipefail

echo "NAME=$NAME"
echo "ANGULAR_VERSION=$ANGULAR_VERSION"

npm install --location=global @angular/cli@$ANGULAR_VERSION
ng new "$NAME" --defaults --style=scss --skip-git

cd "$NAME"
npx ng analytics off

# increase budget size to be able to built with design system
npx ng config "projects.$NAME.architect.build.configurations.production.budgets[0].maximumWarning" 2mb
npx ng config "projects.$NAME.architect.build.configurations.production.budgets[0].maximumError" 2mb

# design system, see https://density.bmwgroup.net/v7/guides/setup/getting-started
npm config set @bmw-ds:registry https://nexus.bmwgroup.net/repository/bmw_npm_repositories/
npm install @angular/cdk@$ANGULAR_VERSION @bmw-ds/components@latest

echo "@import '../node_modules/@bmw-ds/components/density-styles/styles/scss/density-styles-ng.scss';" > src/styles.scss

echo "
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {
  DsButtonModule,
} from '@bmw-ds/components';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DsButtonModule,
  ],
  providers: [ ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
" > src/app/app.module.ts

# list what has been created
ls -lah

