# Authentication and Authorization

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Authentication](#authentication)
  - [OAuth2](#oauth2)
  - [Minimum Authentication Level](#minimum-authentication-level)
- [Authorization](#authorization)
  - [B2X Roles](#b2x-roles)
- [User Information](#user-information)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

Every UNITY app is protected by strong authentication (two-factor authentication with YubiKey) by default.

The way, authentication is working can be configured in the `unity-app.yaml` files like shown below:

```yaml
auth:
  enabled: true
  minAuthLevel: 7000
  oauth:
    enabled: true
  roles:
    b2x:
      any:
        - B2B_I
```

Details on each attribute can be found in the [unity-app schema](./unity-app-schema.md).

## Authentication

As previously stated, each app is protected by with authentication by default.
In rare cases, this protection can be disabled by setting the `auth.enabled` flag to `false`. Note, that this will
expose all endpoints publicly to the entire BMW intranet!
Disabling authentication is recommended only, if the content is public, or if authentication and authorization is
implemented on the
application level. That means, the app development team is responsible for handling all traffic in a secure way.

### OAuth2

If the flag `auth.oauth.enabled` is set to `true`, an unauthenticated request will initiate a redirect to the WebEAM
login screen.

![](../assets/login-screen.png)

This is the recommended setting for front-ends.

REST services, that are called via [XHR](https://en.wikipedia.org/wiki/XMLHttpRequest) requests, should typically not
enable OAuth2. An unauthenticated call (due to invalid or expired token or cookie) to the back-end, should not respond
with a redirect to a login-page, but with
a [401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) status code.
The calling web-page is responsible for reacting to this status code. The simplest possible way is to force a page
reload, which will initiate the OAuth2 flow for the user.

Here is a simple angular HTTP interceptor, which triggers the page reload.

```ts
import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            location.reload();
          }
        }
        return throwError(() => error);
      }));
  }
}
```

In addition, the interceptor must be added to the `providers` in the `AppModule`.

```ts
@NgModule({
  // ...
  providers: [
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
    }
  ],
})
export class AppModule {
}
```

### Minimum Authentication Level

By default, the highest auth level (7000) is required to authenticate to a UNITY app. Currently, users need to
authenticate with a YubiKey as second factor to get the level 7000 authentication.

If the application accepts request with lower auth levels as well, it may reduce the default `auth.minAuthLevel` to a
lower value.

A typical use case would be to serve only data with a low protection need on auth level 1000 (single factor
authentication) and all data on authentication level 7000.

The current user's auth level is passed as custom header `Unity-AuthLevel` to the upstream backend,
which can be evaluated in a Quarkus back-end like shown below.

```java
@Path("/v1/")
public class AuthLevelResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String authLevel(@HeaderParam("Unity-AuthLevel") final String authLevel) {
        return "Your auth level is " + authLevel;
    }
}
```

Read more about auth levels in the [WebEAM documentation](https://atc.bmwgroup.net/confluence/x/14S3KQ).

## Authorization

Simple role requirements can be configured in the unity-app.yaml.

### B2X Roles

If the user requires a B2X role, like `PMD` or `B2B_I`, the following sample configuration can be employed.

```yaml
auth:
  roles:
    b2x:
      any:
        - PMD
        - B2B_I
```

This will reject any request with [403 Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403), if the
user does not have either the `PMD` or the `B2B_I` role.

More advance role checks must be performed in the applications back-end. Roles are passed as custom
headers: `Unity-B2XRole`. Note that this header is repeated, if multiple roles are requested.
Also note that only roles from the `auth.roles.b2x.any` list are passed in that header.

In a Quarkus back-end, roles can be evaluated as follows.

```java
@Path("/v1/")
public class RolesResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String roles(@HeaderParam("Unity-B2XRole") final List<String> roles) {
        return "Your roles are: " + String.join(", ", roles);
    }
}
```

## User Information

Some user's attributes are passed as custom headers. The list below shows, what can be evaluated by the back-end:

* `Unity-Email` e.g. `user@example.com`
* `Unity-B2XRole` e.g. `B2B_I`
* `Unity-AuthLevel` e.g. `7000`
* `Unity-UserName` e.g. `Charly Brown`
* `Unity-UserSub` e.g. `q12345`
* `Unity-Department` e.g. `FG-123`
