---
layout: default
title: HTTP Headers
parent: AppDev Handbook
nav_order: 11
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [HTTP Headers](#http-headers)
  - [Default HTTP Headers](#default-http-headers)
  - [Customizing the HTTP Headers](#customizing-the-http-headers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# HTTP Headers

## Default HTTP Headers

The following HTTP response headers will be set by default by the UNITY platform:

```
X-XSS-Protection: '1; mode=block'
X-Content-Type-Options: 'nosniff'
X-Frame-Options: 'deny'
Content-Security-Policy: frame-ancestors 'self'
```

Note that some additional default headers are set by the Nginx Ingress Controller, which can not be overwritten, e.g
`Strict-Transport-Security: 'max-age=15724800; includeSubDomains'`). For more information, please
refer to the default configuration values of the
[ingress-nginx](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#configuration-options)

## Customizing the HTTP Headers

It is possible to edit or unset the default response headers or to set custom response headers.
This can be achieved by modifying the `unity-app.*.yaml` files.

Unsetting a default header can be done by setting the value for the given header to `null`.
The following example sets the response header `Custom-Header-Name: custom-header-value` and unsets the
`Default-Header-To-Unset`:

```yaml
deployments:
  ui:
    headers:
      response:
        add:
          Custom-Header-Name: custom-header-value
          Default-Header-To-Unset: null
```

Note that the header will be added, regardless of being set by the app's container.
That means, if you set the custom header `Foo: Bar` in the app's container and
`Foo: Baz` in the `unity-app.*.yaml`, the response will have both values:

```
Foo: bar
Foo: Baz
```

This can be fixed by removing the header first. The following snippet added to the `unity-app.*.yaml` file will remove
the `Header-To-Remove` and will overwrite the value of `Header-To-Overwrite`:

```yaml
deployments:
  ui:
    headers:
      response:
        remove:
          - Header-To-Remove
          - Header-To-Overwrite
        add:
          Header-To-Overwrite: new-value
```

Note that manipulating the headers is case-sensitive (the headers `Foo` and `foo` will be treated as two different
ones).
