---
title: Terms of Service
layout: default
nav_order: 1
---

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Terms of Service](#terms-of-service)
  - [Resources](#resources)
  - [Information Protection](#information-protection)
  - [IT Security](#it-security)
  - [App Architecture](#app-architecture)
  - [Databases](#databases)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<!-- START md-to-confluence page-id=3120980865 -->

# Terms of Service

The UNITY platform offers services in a shared responsibility model.

The UNITY team is responsible for

* running the platform
* providing integration with WebEAM to offer authentication and authorization for UNITY apps.

The app developers are responsible for

* building their UNITY app
* configuring their UNITY app inside UNITY
* patching vulnerabilities inside their UNITY app

## Resources

UNITY is built for small, lean apps. That means, only apps with resource requirements within the following limits may
run on UNITY.

* CPU limit ≤ 1000 milli cores (request ≤ 500 milli cores) per container
* Memory limit ≤ 2048 MiB (request ≤ 1024 MiB) per container

## Information Protection

An app developer is granted access to secrets (tokens, passwords) and confidential information (model types, SOP,
EOP, ...).
The app developer is responsible for protecting that information according to the
[corporate security](https://contenthub-de.bmwgroup.net/web/corporatesecurity/informationsschutz-informationssicherheit)
guidelines.

Specifically, tokens, passwords or other secrets must not be sent to the end user at any time.
Data, sent to the end user, must be limited according to the need to know principle.

For data precessed in the app, the Information Classification (ICL), Information Objects (IOBs) and Privacy Impact
Assessment (PIA)  must be maintained by the app developers.

Data, classified "strictly confidential" must not be processed in a UNITY app, as the UNITY platform is not approved
for apps requiring the information security class "highest protection".

## IT Security

The app developer is responsible for maintaining the IT security documentation for the UNITY app.
This includes application clearing and managing IT risks.

Furthermore, Common Vulnerabilities and Exposures (CVEs) found in the app by automatic security scanning solutions
provided by the UNITY platform must be fixed by the app developers.

## App Architecture

UNITY apps are required to be built in a cloud native way. This means, deployable must be stateless and re-deployable at
any time.

Here are some aspects to keep in mind:

* Data on the filesystem is lost after each container restart or deployment and may be used as temporary storage only.
* A container may be restarted automatically at any time (e.g. to move it to another virtual machine).
  This is especially important when designing batch processing.
* Traffic is load balanced between replicas of the deployment.

## Databases

Databases of type PostgreSQL are in piloting phase and may be used on the int environment only.
Make sure to understand the limitations of
the [PostgreSQL Flexible Server](app-dev-handbook/postgresql-flexible-server.html).

Most notably:

* PostgreSQL Flexible Server's may have regular maintenance downtimes.
* PostgreSQL Flexible Server's don't support high availability yet.
* It is the responsibility of the UNITY team to maintain a stable database server, while the app developer is
  responsible for everything inside the databases.

