#!/usr/bin/env bash

set -xeu pipefail

echo "ORG=$ORG"
echo "NAME=$NAME"
REPO_PATH=$(git rev-parse --show-toplevel)
REPO=$(basename "$REPO_PATH")
export REPO
APP_NAME=${REPO#"app-"}
export APP_NAME

SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)

pwd
ls -lah

npm install --location=global gomplate

# based on https://quarkus.io/guides/getting-started
mvn io.quarkus.platform:quarkus-maven-plugin:2.12.3.Final:create \
-DprojectGroupId=com.bmw.unity."$REPO"."$NAME" \
-DprojectArtifactId="$NAME" \
-Dextensions="resteasy-reactive"

(
  cd "$NAME"

  # see https://quarkus.io/guides/container-image#docker
  ./mvnw quarkus:add-extension -Dextensions="container-image-docker,quarkus-smallrye-openapi"

  # patch docker file
  echo 'RUN \
      chmod a+x /opt/jboss/container/java/run/run-java.sh && \
      chmod -R a+x /opt/jboss/container/java
  ' >> src/main/docker/Dockerfile.jvm

  # remove boiler plate home page
  rm "src/main/resources/META-INF/resources/index.html"

  # set properties
  < "$SCRIPT_PATH/templates/application.properties" gomplate >> "src/main/resources/application.properties"
  < "$SCRIPT_PATH/templates/.editorconfig" gomplate >> ".editorconfig"

  # get package name
  GREETING_RESOURCE_PATH=$(find . -name GreetingResource.java)
  GREETING_RESOURCE_TEST_PATH=$(find . -name GreetingResourceTest.java)
  PACKAGE=$(grep "package com.bmw.unity.app" < "$GREETING_RESOURCE_PATH" )
  # adjust sample code
  export PACKAGE
  < "$SCRIPT_PATH/templates/GreetingResource.java" gomplate > "$GREETING_RESOURCE_PATH"
  < "$SCRIPT_PATH/templates/GreetingResourceTest.java" gomplate > "$GREETING_RESOURCE_TEST_PATH"

  # list what has been created
  ls -lah
)

mkdir -p .github/workflows

< "$SCRIPT_PATH/templates/workflows/ci.yaml" gomplate > ".github/workflows/ci-$NAME.yaml"

