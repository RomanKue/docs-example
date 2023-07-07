---
layout: default
title: Security
parent: AppDev Handbook
nav_order: 8
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Security](#security)
- [Dependabot Alerts](#dependabot-alerts)
  - [Known Issues](#known-issues)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Security

Vulnerability scanning and other security features are enabled by default by the UNITY platform.
The goal ist to make fixing security features as for app developers as easy as possible.
However, it is the application developers responsibility to fix vulnerabilities and security features in the appliation
code.

# Dependabot Alerts

Dependabot alerts are enabled for all repositories in the UNITY organisation.

## Known Issues

There is currently a known issue with the `@bmw-ds/components` dependency. There is
a [Malware in @bmw-ds/components ][False Malware Report @bmw-ds/components] alert, which can be safely dismissed as
"This alert is inaccurate or incorrect":

![This-alert-is-inaccurate-or-incorrect.png](..%2Fassets%2FThis-alert-is-inaccurate-or-incorrect.png)

[False Malware Report @bmw-ds/components]: https://teams.microsoft.com/l/message/19:14f4e3a00c0544e2b5a02dd28db3ea92@thread.skype/1656588739336?tenantId=ce849bab-cc1c-465b-b62e-18f07c9ac198&groupId=30b20eef-ffc7-4fa5-aed5-d2f15cfc324c&parentMessageId=1656588739336&teamName=Design%20System%20Community&channelName=Angular&createdTime=1656588739336&allowXTenantAccess=false

# Application Security Testing (AST)

UNITY does not provide any kind of AST out of the box. Apps are responsible for AST and fulfill all BMW requirements on AST.
The [AST Navigator](https://ast-navigator.bmwgroup.net) is a good starting point.
