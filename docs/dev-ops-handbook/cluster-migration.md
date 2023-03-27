---
layout: default
title: Cluster Migration
parent: DevOps Handbook
nav_order: 11
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Steps to perform when migrating a to a new cluster](#steps-to-perform-when-migrating-a-to-a-new-cluster)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Steps to perform when migrating a to a new cluster

1. Request a change to Managed4Wheels to create a new namespace
2. Create a new branch in unity-chart. The branch should have the name <cluster>/<namespace>
3. Adapt unity-chart `values.yaml` in the newly created branch. For the first tests, the `niceFqdn` should have the same value as `namespace.dnsZone`. The certificates in UNITY are configured to handle both URLs.
4. Bootstap unity-chart in the new environment according to this [documentation](https://atc-github.azure.cloud.bmw/UNITY/unity-chart).
5. Add/Adapt necessary secrets in the [UNITY/unity](https://atc-github.azure.cloud.bmw/UNITY/unity) repository and adapt actions if necessary.
6. Add new branch to unity-chart staging
7. Create app bootstrapping artifacts using the `recreate-app-service-account` workflow. This workflow will also update the application GHE secrets. It is recommended to do this at first for one application and if everything is ok, this can be done afterwards for all applications.
8. If an existing environment is migrated, the master keys from the old environment need to be copied to the new one to avoid reencryption.
9. If everything is working fine, the CNAME can be changed to point to the new cluster. This can be done via an ITSM ticket. As an example, the following ticket can be used: INC000042547780.
10. Finally, a cleanup of the old environment should be performed (remove unnecessary branch from the unity-chart, remove old namespace, remove old cluster, etc).
