#!/usr/bin/env bash

set -xeu pipefail

echo "NAME=$NAME"
REPO_PATH=$(git rev-parse --show-toplevel)
REPO=$(basename "$REPO_PATH")
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

  # list what has been created
  ls -lah
)

mkdir -p .github/workflows

< "$SCRIPT_PATH/templates/workflows/ci.yaml" gomplate > ".github/workflows/ci-$NAME.yaml"

