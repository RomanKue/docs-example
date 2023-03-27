---
layout: default
title: Architecture
parent: DevOps Handbook
nav_order: 0
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Architecture](#architecture)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Architecture

The following diagram gives an overview on the UNITY architecture.

```mermaid
graph TB
subgraph K8s Cluster ["K8s Cluster 4Wheels Managed"]
    subgraph ns ["prod"]
    subgraph app-yaml [unity-app.yaml file]
    end
    subgraph unity-operator-deployment [UNITY Operator]
    end
    subgraph app-deployment [app deployment]
    subgraph sidecar-container ["sidecar (Certificates, Authorization, Metrics, Traces)"]
    end
    subgraph main-container [app container]
    end
    end
    subgraph app-ingress [app ingress]
    end
    subgraph app-services [app services]
    end
    subgraph oauth2-proxy [OAuth2 Proxy]
    end
    end
end
subgraph webeam [WebEAM]
end
subgraph external-service ["External Service"]
end
subgraph client [Client]
end
subgraph GitHub Enterprise ["GitHub Enterprise (ATC)"]
    subgraph app-repo [app repository]
    app-yaml
    end
    subgraph container-registry
      subgraph app-image [app image]
      end
    end
end

app-repo-- push -->app-image
app-repo-- update -->app-yaml
app-deployment-- pull -->app-image
sidecar-container--->oauth2-proxy

unity-operator-deployment-- deploy -->app-deployment
unity-operator-deployment-- watch -->app-yaml
oauth2-proxy--->webeam
sidecar-container<-- http -->main-container
client<-- https -->app-ingress
app-ingress<-- https -->sidecar-container
app-services<-- https -->sidecar-container
app-services<-- https -->external-service

```

There is only one `app repository`, `app image` and `app deployment` as an example in this diagram.
In reality, there are many different `app repositories` such as e.g. `app-foo`, `app-bar`, ...
In addition, from each repository, multiple images can be pushed to the container registry (e.g. `app-foo-ui`
and `app-foo-api`, ...) leading to multiple deployments.
For a more detailed diagram, see [Kubernetes](kubernetes.html).
