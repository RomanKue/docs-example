#!/usr/bin/env bash

NAME="$1"

set -xeu pipefail

REPO=$(basename $(git rev-parse --show-toplevel))

echo "NAME=$NAME"
echo "REPO=$REPO"


# based on https://quarkus.io/guides/getting-started
mvn io.quarkus.platform:quarkus-maven-plugin:2.12.1.Final:create \
    -DprojectGroupId=com.bmw.unity."$REPO"."$NAME" \
    -DprojectArtifactId="$NAME" \
    -Dextensions="resteasy-reactive"

cd "$NAME"

# see https://quarkus.io/guides/container-image#docker
./mvnw quarkus:add-extension -Dextensions="container-image-docker"

# list what has been created
ls -lah
