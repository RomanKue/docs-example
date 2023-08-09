---
layout: default
title: PostgreSQL Flexible Server
parent: DevOps Handbook
nav_order: 14
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [PostgreSQL Flexible Server](#postgresql-flexible-server)
  - [Resource Groups](#resource-groups)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# PostgreSQL Flexible Server

🚨 this is the UNITY DevOps team internal documentation. For the application developers documentation how to develop
apps with a PostgreSQL Flexible Server, see [AppDev Handbook](../app-dev-handbook/postgresql-flexible-server.html).

## Resource Groups

Currently, all database servers of an app are provisioned in one resource group per app.
The reason is, that replication or PITR is only possible inside one resource group. Creating a PITR in a different
resource group is currently not possible.

The resource group is created by the unity operator via the Azure API and not via terraform.
The reason for this is, that we have one terraform state per database server. It would not be possible to maintain the
resource group in any of the terraform states, since one resource can only be assigned to one state.
The unity operator will take care of

1. creating a resource group when it does not exist already.
2. destroy the resource group if there is no resource inside anymore.
