---
layout: default
title: Maven Packages
parent: AppDev Handbook
nav_order: 12
---


# Maven Packages

There might be several reasons why you would use GitHub Packages for maven artifacts along with Nexus. Usual reasons are:
* 3rd Party binary libraries, like IBM db2 JDBC driver or Virus-Scanner SDK
* Self-built libraries (or other artifacts) to be used in later pipeline steps

## Manual upload

To do a manual upload of an artifact you have to use maven on commandline with a suitable settings.xml file. In settings.xml there needs to be a section for GitHub with your Token for authorization. In Unix-like system the default location of that file is `~/.m2/settings.xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <servers>
    <server>
      <id>atc-github-packages</id>

      <username> put your qnumber here </username>
      <password> put your github token here </password>
    </server>
  </servers>
</settings>
```

When generating your Token in GitHub User Settings it must have the scope `write:packages`.

A commandline to perform upload might look like this:

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

Note parameter `repositoryId` must have same value as server `<id>` in `settings.xml`. In this sample `generatePom` is set to `true` as there is no manually maintained pom file for this package. You might set it to `false` and upload pom file with a similar command. In this sample `maven.resolver.transport` is set to `wagon` as otherwise there might be errors with some maven versions.

## Using GitHub Packages in dependency management

Maven provides several mechanisms how additional binary repositories may be used. Here is a sample `settings.xml` file which uses GitHub Packages along with BMW Nexus:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <servers>
    <server>
      <id>atc-github-packages</id>
      <username>dummy</username>
      <password>${GITHUB_TOKEN}</password>
    </server>
  </servers>

  <mirrors>
    <mirror>
      <id>Nexus</id>
      <name>BMW Nexus</name>
      <url>https://nexus.bmwgroup.net/repository/bmw_repositories/</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>

  <profiles>
    <profile>
      <id>ghe-packages</id>
      <repositories>
        <repository>
          <id>atc-github-packages</id>
          <name>atc-github-packages</name>
          <url>https://maven.atc-github.azure.cloud.bmw/UNITY/<git repository name>/</url>
        </repository>
      </repositories>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>ghe-packages</activeProfile>
  </activeProfiles>

</settings>
```

You might commit such a `settings.xml` and use it in your workflows. Therefore you may set `GITHUB_TOKEN` as environment variable and use maven parameter `-s`.

```yaml
        env:
          GITHUB_TOKEN: ${{ github.token }}
        run: |
          mvn --batch-mode clean package -s settings.xml
```
