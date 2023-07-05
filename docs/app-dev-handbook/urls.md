---
layout: default
title: URLs
parent: AppDev Handbook
nav_order: 6
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [URLs](#urls)
  - [IP Ranges](#ip-ranges)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# URLs

UNITY apps are exposed on the unity domains:

* [unity-test.bmwgroup.net](https://unity.bmwgroup) (for UNITY platform development only)
* [unity-int.bmwgroup.net](https://unity.bmwgroup) (for UNITY app testing and integration)
* [unity.bmwgroup.net](https://unity.bmwgroup) (for UNITY app production use)

The deployments of a UNITY app are exposed on a path as follows:
[unity-test.bmwgroup.net/foo/ui/](https://unity.bmwgroup/foo/ui)
The first path segment is the name of the UNITY app, while the second is the name of the deployment.
A `unity-app.*.yaml` file for the example URL would look as follows:

```yaml
name: foo
deployments:
  ui:
    container:
    # ...
```

So, in general, a UNITY app may expose as many deployments as needed.
To make one deployment the home page of the app, one redirect may be configured, which redirects all traffic
from
[unity-test.bmwgroup.net/foo/ui/](https://unity.bmwgroup/foo/)
to that home page. A typical configuration looks as follows:

```yaml
name: foo
redirect: ui/
deployments:
  ui:
    container:
    # ...
```

Which redirects all traffic from
[unity-test.bmwgroup.net/foo/](https://unity.bmwgroup/foo/)
to
[unity-test.bmwgroup.net/foo/ui/](https://unity.bmwgroup/foo/ui/).
Back-end only applications may configure redirects to a Swagger UI page instead:

```yaml
name: foo
redirect: api/swagger-ui
deployments:
  api:
    container:
    # ...
```

## IP Ranges

In order to configure firewall rules to access UNITY the following IP ranges are used to expose UNITY:

* [unity-int.bmwgroup.net](https://unity.bmwgroup): Network CIDR: `10.11.114.128/25`
* [unity.bmwgroup.net](https://unity.bmwgroup): Network CIDR: `10.6.181.224/27`
