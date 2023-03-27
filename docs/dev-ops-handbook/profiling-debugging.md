---
layout: default
title: JMX Profiling
parent: DevOps Handbook
nav_order: 8
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [JMX Profiling](#jmx-profiling)
- [Remote debugging](#remote-debugging)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# JMX Profiling

It is possible to start JMX profiling for applications running on the UNITY cluster:

```bash
helm upgrade app-services oci://containers.atc-github.azure.cloud.bmw/unity/unity-app --version <chart-version> --set global.main.jmxremote.enabled=true,global.main.jmxremote.port=10500 -n int --reuse-values
```
If not specified, the default port will be 10500.

After the application started, it is possible to do a port-forwarding on port 10500:

```bash
kubectl port-forward app-services-api-799696f469-p9wcm 10500:10500 -n int
```

For profiling the application, different profilers can be used. An example which comes together with the JDK is Visual VM,
which can be started by running the command jvisualvm (provided that the JDK is in the Path).

# Remote debugging

It is possible to perform remote debugging on an application running in the UNITY cluster:

```bash
helm upgrade app-services oci://containers.atc-github.azure.cloud.bmw/unity/unity-app --version <chart-version> --set global.main.remoteDebug.enabled=true,global.main.remoteDebug.port=5005 -n int --reuse-values
```
If not specified, the default port will be 5005.

After the application started, it is possible to do a port-forwarding on port 5005:

```bash
kubectl port-forward app-services-api-799696f469-p9wcm 5005:5005 -n int
```

Afterwards it is possible to start a remote debugger in IntelliJ and connect to localhost:5005.
