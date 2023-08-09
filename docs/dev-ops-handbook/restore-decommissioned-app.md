---
layout: default
title: Restore decommission App
parent: DevOps Handbook
nav_order: 10
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Restore Decommissioned App](#restore-decommissioned-app)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Restore Decommissioned App

If you want to restore a decommissioned app you need to:
1. Unarchive app repository (only an admin can do this)
2. Run [Recreate App Service Account][Recreate App Service Account] workflow for each environment of the app you want to restore.
This will recreate not only the service account but also the secretes, roles and role bindings in k8s cluster for the selected environment.

[Recreate App Service Account]: https://atc-github.azure.cloud.bmw/UNITY/unity/actions/workflows/recreate-app-service-account.yaml
