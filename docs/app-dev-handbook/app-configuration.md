---
layout: default
title: App Configuration
parent: AppDev Handbook
nav_order: 3
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [App Configuration](#app-configuration)
  - [Environment Variables](#environment-variables)
  - [Secrets](#secrets)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# App Configuration

Apps may need environment specific configuration, such as URLs to external systems or secret information like
client-ids.

## Environment Variables

Environment variables can be configured in the `unity-app.*.yaml` files.

```yaml
deployments:
  api:
    # ...
    container:
      env:
        FOO:
          value: some-value
        BAR:
          value: another-value
```

The values may be set specific to the environment.

Especially with [Quarkus](https://quarkus.io), environment variables can be used to set all
[Config Sources](https://quarkus.io/guides/config-reference#configuration-sources).
Other configuration mechanisms, like config files, are currently not supported.

## Secrets

To configure an app with secret information, values can be stored in encrypted form in the `unity-app.*.yaml` files.

```yaml
deployments:
  api:
    # ...
    container:
      secretEnv:
        PASSWORD:
          value: crypt.v1[atAkljasdjs/0==]
```

In order to develop locally, you may need the application service account token. To export the service account token
stored in GitHub, you can run manually the `store-secrets` workflow.

🚨 Note that the token may be rolled (new token is generated) by UNITY from time to time. Extracting the service account
token is meant for development purposes and must not be used for external service interaction.

There is currently no convenient way to encrypt information from the developer perspective. Contact the UNITY team if
you need this feature. In scope of [UNITYAPPS-42](https://atc.bmwgroup.net/jira/browse/UNITYAPPS-42) there will be an
action to encrypt secrets in a convenient way in the future.
