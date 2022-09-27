#!/usr/bin/env bash

set -xeu pipefail

echo "ORG=$ORG"
echo "NAME=$NAME"
REPO_PATH=$(git rev-parse --show-toplevel)
REPO=$(basename "$REPO_PATH")
APP_NAME=${REPO#"app-"}
export REPO
echo "REPO=$REPO"

SCRIPT=$(realpath "$0")
SCRIPT_PATH=$(dirname "$SCRIPT")

pwd
ls -lah

npm install --location=global gomplate

# based on https://quarkus.io/guides/getting-started
mvn io.quarkus.platform:quarkus-maven-plugin:2.12.1.Final:create \
-DprojectGroupId=com.bmw.unity."$REPO"."$NAME" \
-DprojectArtifactId="$NAME" \
-Dextensions="resteasy-reactive"

(
  cd "$NAME"

  # see https://quarkus.io/guides/container-image#docker
  ./mvnw quarkus:add-extension -Dextensions="container-image-docker"

  # patch docker file
  echo 'RUN \
      chmod a+x /opt/jboss/container/java/run/run-java.sh && \
      chmod -R a+x /opt/jboss/container/java
  ' >> src/main/docker/Dockerfile.jvm

  # remove boiler plate home page
  rm "src/main/resources/META-INF/resources/index.html"

  # get package name
  PACKAGE=$(grep "package com.bmw.unity.app" < "src/main/java/com/bmw/unity/app/$APP_NAME/api/GreetingResource.java" )
  # adjust sample code
  < "$SCRIPT_PATH/templates/GreetingResource.java" gomplate > "src/main/java/com/bmw/unity/app/$APP_NAME/api/GreetingResource.java"
  < "$SCRIPT_PATH/templates/GreetingResourceTest.java" gomplate > "src/test/java/com/bmw/unity/app/$APP_NAME/api/GreetingResourceTest.java"

  # list what has been created
  ls -lah
)

mkdir -p .github/workflows

< "$SCRIPT_PATH/templates/workflows/ci.yaml" gomplate > ".github/workflows/ci-$NAME.yaml"

