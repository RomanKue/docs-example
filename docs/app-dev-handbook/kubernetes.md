---
layout: default
title: Profiling and Debugging
parent: AppDev Handbook
nav_order: 10
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Kubectl](#kubectl)
  - [Getting the Service Account Token of the Application](#getting-the-service-account-token-of-the-application)
    - [Doing `kubectl` Calls](#doing-kubectl-calls)
  - [Profiling and Debugging](#profiling-and-debugging)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Kubectl

When developing locally, it could be useful to get information about the Kubernetes objects of the application or
to perform port forwarding to one of the applications containers. This can be done by using `kubectl`.

## Getting the Service Account Token of the Application

The first step when interacting with the cluster should be getting the service account token of the application.
Using the token you will have access to the kubernetes objects belonging to your application, or you can [call external
services](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/app-dev-handbook/external-services.html#testing-locally)
when developing locally.

Downloading the token is possible using the `store-secrets` workflow.

![store-secrets.png](..%2Fassets%2Fstore-secrets.png)

After the action has completed successfully, the `secrets.kdbx` file can be downloaded from the **Summary > Artifacts**
section. This file can be opened later with the password provided when starting the workflow and it will contain the
secrets from the GitHub repository.

🚨 Note that the token may be rolled (new token is generated) by UNITY from time to time. Extracting the service account
token is meant for development purposes and must not be used for external service interaction.

![store-secrets-result.png](..%2Fassets%2Fstore-secrets-result.png)

### Doing `kubectl` Calls

Using the secrets from the repository, the following returns the secret `app-foo`:

```bash
kubectl --server "https://$KUBERNETES_HOST" --token "$KUBERNETES_TOKEN" --namespace "$KUBERNETES_NAMESPACE" get secret app-foo
```

For more information about `kubectl` please refer to the [official documentation](https://kubernetes.io/docs/reference/kubectl/)

###Perform Port-Forwarding

The following will forward the `8080` port of the pod to `8080` port of the localhost :

```bash
kubectl --server "https://$KUBERNETES_HOST" --token "$KUBERNETES_TOKEN" --namespace "$KUBERNETES_NAMESPACE" port-forward app-foo-api-5c484fd67c-9x9ll 8080:8080
```

This can be used later for remote debugging and profiling as described in the next section.

## Profiling and Debugging

In order to start remote profiling and/or remote debugging for an application running on the UNITY cluster, you need to
address the UNITY development team to configure the application accordingly.

After this has been done, it will be possible to do a [port-forwarding](./external-services.md#perform-port-forwarding)
to the configured open port, using the secrets from the repository:

```bash
kubectl --server "https://$KUBERNETES_HOST" --token "$KUBERNETES_TOKEN" --namespace "$KUBERNETES_NAMESPACE" port-forward app-foo-api-5c484fd67c-9x9ll 10500:10500
```

For profiling the application, different profilers can be used. An example which comes together with the JDK is Visual VM,
which can be started by running the command jvisualvm (provided that the JDK is in the Path).

A remote debugger in IntelliJ can be used with a connection to localhost:5005.
