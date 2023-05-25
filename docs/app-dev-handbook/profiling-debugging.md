---
layout: default
title: Profiling and Debugging
parent: AppDev Handbook
nav_order: 10
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Profiling and Debugging](#profiling-and-debugging)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Profiling and Debugging

In order to start remote profiling and/or remote debugging for an application running on the UNITY cluster, you need to
address the UNITY development team to configure the application accordingly. 

After this has been done, it will be possible to do a [port-forwarding](./external-services.md#perform-port-forwarding) 
to the configured open port, using the secrets from the repository:

```bash
kubectl --server "https://$KUBERNETES_HOST" --token "$KUBERNETES_TOKEN" --namespace "$KUBERNETES_NAMESPACE" port-forward app-foo-api-5c484fd67c-9x9ll 8080:8080
```

For profiling the application, different profilers can be used. An example which comes together with the JDK is Visual VM,
which can be started by running the command jvisualvm (provided that the JDK is in the Path).

A remote debugger in IntelliJ can be used with a connection to localhost:5005.
