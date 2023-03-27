---
layout: default
title: Kubernetes
parent: DevOps Handbook
nav_order: 2
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Kubernetes](#kubernetes)
  - [Architecture](#architecture)
  - [Labels](#labels)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Kubernetes

## Architecture

The following diagram gives an overview on the integration of GitHub Enterprise and Kubernetes architecture.

```mermaid
graph LR
subgraph K8s Cluster
    subgraph unity-operator-deployment [unity-operator]
    end
    subgraph schema-deployment [schema]
    end
    subgraph app-foo-secret [app-foo secret]
    end
    subgraph app-bar-secret [app-bar secret]
    end
    subgraph app-foo-ui-deployment [app-foo-ui]
    end
    subgraph app-foo-api-deployment [app-foo-api]
    end
    subgraph app-bar-ui-deployment [app-bar-ui]
    end
    subgraph app-bar-api-deployment [app-bar-api]
    end
end
subgraph GitHub Enterprise
    subgraph schema-repo [schema repository]
    end
    subgraph unity-helm-charts-repo [unity-helm-charts repository]
    end
    subgraph unity-operator-repo [unity-operator repository]
    end
    subgraph unity-chart-repo [unity-chart repository]
    end
    subgraph app-foo-repo [app-foo repository]
    end
    subgraph app-bar-repo [app-bar repository]
    end

    subgraph container-registry
      subgraph unity-app-chart [unity-app chart]
      end
      subgraph schema-image [schema image]
      end
      subgraph unity-operator-image [unity-operator image]
      end
      subgraph app-foo-ui-image [app-foo-ui image]
      end
      subgraph app-foo-api-image [app-foo-api image]
      end
      subgraph app-bar-ui-image [app-bar-ui image]
      end
      subgraph app-bar-api-image [app-bar-api image]
      end
    end
end

unity-helm-charts-repo-- push -->unity-app-chart
schema-repo-- push -->schema-image
unity-operator-repo-- push -->unity-operator-image
app-foo-repo-- push -->app-foo-ui-image
app-foo-repo-- push -->app-foo-api-image
app-bar-repo-- push -->app-bar-ui-image
app-bar-repo-- push -->app-bar-api-image

unity-chart-repo-- GitOps -->unity-operator-deployment
unity-chart-repo-- GitOps -->schema-deployment
app-foo-repo-- GitOps -->app-foo-secret
app-bar-repo-- GitOps -->app-bar-secret

schema-deployment-- pull -->schema-image
app-foo-ui-deployment-- pull -->app-foo-ui-image
app-foo-api-deployment-- pull -->app-foo-api-image
app-bar-ui-deployment-- pull -->app-bar-ui-image
app-bar-api-deployment-- pull -->app-bar-api-image


unity-operator-deployment-- watch -->app-foo-secret
unity-operator-deployment-- watch -->app-bar-secret
unity-operator-deployment-- download for validation -->schema-deployment
unity-operator-deployment-- download for Helm upgrade -->unity-app-chart

unity-operator-deployment-- deploy -->app-foo-ui-deployment
unity-operator-deployment-- deploy -->app-foo-api-deployment
unity-operator-deployment-- deploy -->app-bar-ui-deployment
unity-operator-deployment-- deploy -->app-bar-api-deployment
```

## Labels

All objects managed in Kubernetes MUST have the following labels:

* `app.kubernetes.io/name` the name of the repo, e.g. `app.kubernetes.io/name: app-foo`.
* `app.kubernetes.io/managed-by` the name of the responsible management component,
  e.g. `app.kubernetes.io/managed-by: unity` or `app.kubernetes.io/managed-by: Helm`.
  If set set `unity` it indicates the resources was created by a workflow from
  the [UNITY/unity](https://atc-github.azure.cloud.bmw/UNITY/unity) repo.
  Resources that are managed by `Helm`, are usually created by
  the [unity-operator](https://atc-github.azure.cloud.bmw/UNITY/unity-operator) and should not be edited manually.
* `app.kubernetes.io/component` the name of the component of the app, this is optional and not set on all resources.
  An example is `app.kubernetes.io/component: api` if the deployment or pod belongs to the deployable `api` of the app `
  foo.

To get all resources that are managed by `unity` for the app `foo` run:

```bash
kubectl get all,secrets,rolebindings,roles \
  -l app.kubernetes.io/name=app-foo,app.kubernetes.io/managed-by=unity
```

To get all resources of the component `api` from the app `foo` run:

```bash
kubectl get all,secrets,rolebindings,roles \
  -l app.kubernetes.io/name=app-foo,app.kubernetes.io/component=api
```

