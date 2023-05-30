---
layout: default
title: Maven Packages
parent: AppDev Handbook
nav_order: 12
---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Maven Packages](#maven-packages)
  - [Manual upload](#manual-upload)
  - [GitHub Packages in Dependency Management](#github-packages-in-dependency-management)
  - [BMW Nexus as Mirror](#bmw-nexus-as-mirror)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Maven Packages

There might be several reasons why you would use GitHub Packages for maven artifacts along with Nexus. Usual reasons
are:

* 3rd Party binary libraries, like IBM db2 JDBC driver or Virus-Scanner SDK
* Self-built libraries (or other artifacts) to be used in later pipeline steps

## Manual upload

To do a manual upload of an artifact you have to use maven on the command line with a suitable `settings.xml` file.
In `settings.xml`, there needs to be a section for GitHub with
your [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
with scope `write:packages` for authorization.
In Unix-like systems, the default location of that file is `~/.m2/settings.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <servers>
    <server>
      <id>atc-github-packages</id>
      <username>put your qnumber here</username>
      <password>put your github token here</password>
    </server>
  </servers>
</settings>
```

A command line to perform upload might look like this:

```bash
mvn deploy:deploy-file  \
  -Dfile="<path to file to upload>" \
  -Durl=https://maven.atc-github.azure.cloud.bmw/UNITY/<git repository name> \
  -DrepositoryId=atc-github-packages \
  -DgroupId="<maven groupId to reference file later>" \
  -DartifactId="<maven artifactId to reference file later>" \
  -Dversion="<maven version to reference file later>" \
  -DgeneratePom=true \
  -Dmaven.resolver.transport=wagon
```

Note parameter `repositoryId` must have same value as server `<id>` in `settings.xml`. In this sample `generatePom` is
set to `true` as there is no manually maintained pom file for this package. You might set it to `false` and upload pom
file with a similar command. In this sample `maven.resolver.transport` is set to `wagon` as otherwise there might be
errors with some maven versions.

## GitHub Packages in Dependency Management

Maven provides several mechanisms how additional binary repositories may be used. Here is a sample `settings.xml` file
which uses GitHub Packages along with BMW Nexus:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <servers>
    <server>
      <id>atc-github-packages</id>
      <username>user</username>
      <password>${env.GITHUB_TOKEN}</password>
    </server>
  </servers>
  <profiles>
    <profile>
      <id>atc-github</id>
      <repositories>
        <repository>
          <id>atc-github-packages</id>
          <name>atc-github-packages</name>
          <url>https://maven.atc-github.azure.cloud.bmw/UNITY/${env.REPO}/</url>
        </repository>
      </repositories>
    </profile>
  </profiles>
  <activeProfiles>
    <activeProfile>atc-github</activeProfile>
  </activeProfiles>
</settings>
```

You might commit such a `settings.xml` and use it in your workflows.
Therefore, you may set `GITHUB_TOKEN` as well as `REPO` as environment variables and use maven parameter `--settings`.

```yaml
      - name: clean package
        working-directory: ${{ env.DEPLOYMENT }}
        env:
          GITHUB_TOKEN: ${{ github.token }}
          REPO: ${{ github.event.repository.name }}
        run: |
          mvn --batch-mode clean package --settings settings.xml
```

## BMW Nexus as Mirror

To fetch packages from the central BMW nexus instead of directly from maven central, a `settings.xml` can be set up as
follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <mirrors>
    <mirror>
      <id>nexus</id>
      <name>BMW Nexus</name>
      <url>https://nexus.bmwgroup.net/repository/bmw_repositories/</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>
```

This `settings.xml` can be used locally and in a workflow by adding the maven parameter `--settings`.

```bash
mvn --batch-mode clean package --settings settings.xml
```
