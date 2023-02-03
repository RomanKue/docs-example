---
layout: default
title: HTTP Headers
parent: AppDev Handbook
nav_order: 11
---

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [HTTP Headers](#http-headers)
  - [Default HTTP Headers](#default-http-headers)
  - [Customizing the HTTP Headers](#customizing-the-http-headers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# HTTP Headers

## Default HTTP Headers

The following HTTP response headers will be set by default by the UNITY platform:

```http
X-XSS-Protection: '1; mode=block'
X-Content-Type-Options: 'nosniff'
Strict-Transport-Security: 'max-age=31536000; includeSubDomains'
X-Frame-Options: 'deny'
Content-Security-Policy: frame-ancestors 'self'
```

## Customizing the HTTP Headers

It is possible to edit or unset the default response headers or to set custom response headers.
This can be achieved by modifying the `unity-app.*.yaml` files.

Unsetting a default header can be done by setting the value for the given header to `null`.
The following example sets the response header `"Custom-Header-Name": "custom-header-value"` and unsets the
`"Default-Header-To-Unset"`:

```yaml
deployments:
  ui:
    headers:
      response:
        add:
          "Custom-Header-Name": "custom-header-value"
          "Default-Header-To-Unset": null
```

