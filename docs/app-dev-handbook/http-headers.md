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
X-Content-Type-Options: 'nosniff'
X-Frame-Options: 'deny'
Content-Security-Policy: frame-ancestors 'self'; form-action 'self'; object-src 'none';
```

Note that some additional default headers are set by
the [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx), which can not be overwritten, e.g
`Strict-Transport-Security: 'max-age=15724800; includeSubDomains'`). For more information, please
refer to the default configuration values of the
[ingress-nginx](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#configuration-options).

⚠️ The default setting for `Content-Security-Policy` does not provide maximum security, because the most secure
setting (`default-src 'self'`) breaks
frameworks, such as [Swagger UI](https://swagger.io/tools/swagger-ui/) and [Angular](https://angular.io).
Read more about it in [Security](security.html).

`X-XSS-Protection` was a recommended security related header in the past. As it
is [deprecated](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection), this header is not set
anymore. Please set a secure `Content-Security-Policy` instead.

## Customizing the HTTP Headers

It is possible to edit or unset the default response headers or to set custom response headers.
This can be achieved by modifying the `unity-app.*.yaml` files.

Unsetting a default header can be done by setting the value for the given header to `null`.
The following example sets the response header `Foo`, unsets the default `X-Frame-Options` header and sets the header
`Baz` with two different values:

```yaml
deployments:
  ui:
    headers:
      response:
        add:
          X-Frame-Options: null
          Foo: Bar
          Baz:
            - Qux
            - Fred
```

Note that the headers will be added, regardless of being set by the app's container.
That means, if you set the custom header `Foo: Bar` in the app's container and
`Foo: Baz` in the `unity-app.*.yaml`, the response will have both values:

```
Foo: Bar
Foo: Baz
```

This can be fixed by removing the header first, essentially replacing a header.

```yaml
deployments:
  ui:
    headers:
      response:
        add:
          X-Frame-Options: null
          Foo: Bar
        remove:
          - Foo
```

Note that header removal is case-insensitive.

Default headers can be set from the application container when unset (e.g. `X-Frame-Options: null`).
To make sure this header is never set at all, add it also to the `remove` section.

```yaml
deployments:
  ui:
    headers:
      response:
        add:
          X-Frame-Options: null
        remove:
          - X-Frame-Options
```
