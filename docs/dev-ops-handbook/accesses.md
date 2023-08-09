---
layout: default
title: Accesses
parent: DevOps Handbook
nav_order: 13
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [GitHub](#github)
- [Kubernetes Cluster (M4W)](#kubernetes-cluster-m4w)
- [wiz.io](#wizio)
- [Azure Self Service Portal](#azure-self-service-portal)
- [Azure Subscriptions](#azure-subscriptions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# GitHub

In order to have access to the platform repositories in GitHub, a user needs to be added to the
[UNITY DevOps Team](https://atc-github.azure.cloud.bmw/orgs/UNITY/teams/unity-devops). If the user is an external, they
should be added to the [UniCode Team](https://atc-github.azure.cloud.bmw/orgs/UNITY/teams/unicode).

# Kubernetes Cluster (M4W)

In order to get access to the M4W Kubernetes Cluster, a user needs to be added in one of the
[ADGR Groups](https://adgr-prod.bmwgroup.net/adgr/groups.jsf):
- for pdm-unity-int: APPL_pdm_unity_integration or APPL_pdm_unity_integration_view
- for pdm-unity: APPL_pdm_unity_production_admin or APPL_pdm_unity_production_view

# wiz.io

In order to get access to wiz.io, a service request incident to `it-security-cspm:global` support group needs to be
created. Access will be awarded for the entire product, therefore the product (SWP-4236), needs to be specified in the incident.
One of the owners of the product needs to be added as Contact to the incident. As an example, also see INC000044189072.

More information can be found [here](https://atc.bmwgroup.net/confluence/x/BqMMvw).

# Azure Self Service Portal

In order to get access to the [Azure Self Service Portal](https://manage.azure.bmw.cloud/), a user needs to be assigned
a role in this portal. This can be done in the `Users > Assign User` section. This will also provide access to the
Azure subscription (FPC default user role). If only access to the subscription is needed, please see the following section.

# Azure Subscriptions

The Azure Subscription accesses are managed by several ADGR Groups. In order to have access to one or the other Azure
subscription, a user needs to be added to the correct ADGR group. The ADGR groups are:
- APPL_unity_dev_azure_admin and APPL_unity_dev_azure - for unity-test and unity-int
- APPL_unity_prod_azure_admin and APPL_unity_prod_azure - for unity (production)

