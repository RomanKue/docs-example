---
layout: default
title: References
parent: DevOps Handbook
nav_order: 12
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [References](#references)
  - [Gangway](#gangway)
    - [Dev (Test and Int)](#dev-test-and-int)
    - [Prod](#prod)
  - [Grafana](#grafana)
    - [Dev (Test and Int)](#dev-test-and-int-1)
    - [Prod](#prod-1)
  - [Prometheus](#prometheus)
    - [Dev (Test and Int)](#dev-test-and-int-2)
    - [Prod](#prod-2)
  - [Active Directory Group (ADGR)](#active-directory-group-adgr)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# References

The following sections list links and references to various systems and portals, that are relevant for every UNITY
DevOps member.

## Gangway

The gangway can be used to download a `kubeconfig` file. This is required to access the K8s clusters.

This only available to members of the relevant [AD groups](#active-directory-group-adgr).

### Dev (Test and Int)

[gangway](https://gangway.apps.pdm-unity-int.azure.cloud.bmw)

### Prod

[Grafana](https://gangway.apps.pdm-unity-int.azure.cloud.bmw)

## Grafana

The K8s cluster Grafana is available as listed below.
This should not be confused with the Grafana instance for app developers which is documented
in [AppDev Handbook: Telemetry](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/app-dev-handbook/telemetry.html)

### Dev (Test and Int)

[Grafana](https://grafana.apps.pdm-unity-int.azure.cloud.bmw)

### Prod

[Grafana](https://grafana.apps.pdm-unity-int.azure.cloud.bmw)

## Prometheus

The prometheus UI can be helpful for analyzing metrics, alerts TSDB status and so forth in case of incidents.

### Dev (Test and Int)

[Prometheus UI](https://prometheus.apps.pdm-unity-int.azure.cloud.bmw)

### Prod

[Prometheus UI](https://prometheus.apps.pdm-unity-int.azure.cloud.bmw)

## Active Directory Group (ADGR)

Group admins can assign group members in the
[ADGR Active Directory Group Tool](http://adgr-prod.bmwgroup.net)

Access to the K8s clusters is managed via the following groups

* `APPL_pdm_unity_integration`
* `APPL_pdm_unity_integration_view`
* `APPL_pdm_unity_production_admin`
* `APPL_pdm_unity_production_view`

Owner groups for the clusters are:

* `APPL_pdm_unity_integration` (int)
* `APPL_pdm_unity_production_admin` (prod)

See [Cluster Owner ADGR Group](https://developer.bmwgroup.net/docs/4wheels-managed/applications_integration/self_service_api/#cluster-owner-adgr-group)
for further details.
