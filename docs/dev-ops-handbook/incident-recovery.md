---
layout: default
title: Incident Recovery
parent: DevOps Handbook
nav_order: 6
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Incident Recovery](#incident-recovery)
  - [Fix Broken Service Account Token](#fix-broken-service-account-token)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Incident Recovery

The sections below describe certain incidents and how to recover from them.

## Fix Broken Service Account Token

It may happen that the service account token stored in GHE secrets gets invalid or the user deletes it by accident.

This can be fixed by running the `recreate-app-service-account` workflow, which recreates the token on the k8s cluster
and stores it in the GHE secrets for the selected environment and repos matching the specified regular expression.
