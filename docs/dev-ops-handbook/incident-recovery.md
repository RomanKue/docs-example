---
layout: default
title: Incident Recovery
parent: DevOps Handbook
nav_order: 7
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Incident Recovery](#incident-recovery)
  - [Fix Broken Service Account Token](#fix-broken-service-account-token)
  - [Fix Missing or Broken Master Key](#fix-missing-or-broken-master-key)
  - [Fix Crashing UNITY Operator](#fix-crashing-unity-operator)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Incident Recovery

The sections below describe certain incidents and how to recover from them.

## Fix Broken Service Account Token

It may happen that the service account token stored in GHE secrets gets invalid or the user deletes it by accident.

This can be fixed by running the
[`recreate-app-service-account`](https://atc-github.azure.cloud.bmw/UNITY/unity/actions/workflows/recreate-app-service-account.yaml)
workflow, which recreates the token on the k8s cluster and stores it in the GHE secrets for the selected environment
and repos matching the specified regular expression.

## Fix Missing or Broken Master Key

To encrypt the secrets in an automated way, the master key must be stored in GHE.

This (or fixing a broken master key) can be achieved by running the
[`sync-master-keys`](https://atc-github.azure.cloud.bmw/UNITY/unity/actions/workflows/sync-master-keys.yaml)
workflow, which stores the master key in GHE for the selected environment and repos matching the specified regular
expression as `CRYPT_MASTER_KEY` (or updates the existing one if overwrite is set to true).

## Fix Crashing UNITY Operator

In case, the UNITY operator is in a crashing looping state, because one app is configured such that it breaks the
operator (which should not happen).
To make sure the UNITY operator gets into normal state, one can exclude an app (causing the issue) from being handled by
the unity-operator.

To do so, annotate the app's secret with `unity-operator.unity.bmwgroup.net/disabled: 'true'`. This can be done by
running

```bash
kubectl annotate secret app-foo --overwrite unity-operator.unity.bmwgroup.net/disabled=true
```

⚠️ After the root cause of the issue was solved, the annotation must be set back to `false` manually.

