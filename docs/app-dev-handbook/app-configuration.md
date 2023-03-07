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
    - [Encrypt in the Browser](#encrypt-in-the-browser)
    - [Encrypt via `gh`](#encrypt-via-gh)
  - [Headers and Cookies](#headers-and-cookies)

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

To encrypt a value, run the `encrypt` workflow in your repository.

There are two ways to do this, via the browser or via [`gh`](https://cli.github.com).
For experts, the preferred way should be using `gh`, since there is no risk of caching secret data in the browser.

### Encrypt in the Browser

![](../assets/actions-encrypt-workflow.png)

Specify the yaml path, e.g. `deployments.api.container.secretEnv.PASSWORD.value`, the secret value `psst` and the
environment.

![](../assets/run-encrypt-workflow.png)

The workflow will take the `CRYPT_MASTER_KEY`, stored in your repository, and encrypt the secret value.
Then a pull request will be created, which you can review, approve and merge afterwards.

![](../assets/approve-password-pr.png)

🚨 Never share the `CRYPT_MASTER_KEY` with anyone, this key can be used to decrypt all the secrets in your yaml file.

⚠️ One drawback of the browser based approach is, that the secret value may be cached in the browser. Make sure the
secret information is removed from the browser after running the workflow. In Chrome this can be done by going back to
the input, navigating down with ↓ and delete the entry with Shift + Del.

![](../assets/autofill-secret.png)

You can rename the environment variable afterwards.
Note, that encryption is environment specific as `CRYPT_MASTER_KEY`s are different, so you cannot copy the encrypted
value from `int` to `prod`. Instead, run the encrypt workflow for both environments.

When deploying an app, the `deploy-unity-app` action will validate that all secrets can be decrypted with the
current `CRYPT_MASTER_KEY`. If decryption fails, the app cannot be deployed.

### Encrypt via `gh`

Make sure `gh` is installed from [`cli.github.com`](https://cli.github.com)
and follow [GitHub CLI quickstart](https://docs.github.com/en/enterprise-server/github-cli/github-cli/quickstart).

Next, from your repository run:

```bash
gh workflow run encrypt -f "environment=int" -f "yaml-path=deployments.api.container.secretEnv.PASSWORD.value" -f "secret=pst"
```

## Headers and Cookies

You can also set custom headers or cookies to provide environment specific configuration for your app.
See [HTTP Headers](http-headers.html) for details.

When using cookies, keep in mind that these mey be shared on the entire domain `unity.bmwgroup.net`.
So it is recommended to use the following naming convention and config:

```yaml
deployments:
  ui:
    headers:
      response:
        add:
          Set-Cookie: app-foo-ui-environment=int; Secure; SameSite=Strict; Path=/foo/ui
```

The name of the cookie `app-foo-ui-environment` should have the following segments:

`app-<name>-<deployment>-<cookie-name>`

* `<name>` name of your app
* `<deployment>` name of the deployment (optional)
* `<cookie-name>` name of the cookie value

Setting `Path=/foo/ui` is also recommended.
Check [Set-Cookie on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) for more details.
