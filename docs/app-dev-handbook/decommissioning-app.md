---
layout: default
title: Decommission App
parent: AppDev Handbook
nav_order: 16
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Decommission App](#decommission-app)
- [Restore Decommissioned App](#restore-decommissioned-app)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Decommission App

If you want to decommission a unity app you need to create a [Decommission App][Decommission App] issue.
Change `<my-app-name>` with your app name and submit the issue.
After submitting the issue an automated process of validation will start and in each step if something is wrong we will comment on the issue.
Here are the validation steps, required to be able to decommission an app:
* App repository should exist
* The app repository should have `unity-app` topic on it
* The user that creates the issue and requests the app decommission has to be the app admin or an admin

If the app meets all the expectations we will automatically start to decommission it. Following actions will happen:
1. The app repository will be archived
2. Delete all `secret`, `rolebinding`, `role` and `serviceaccount`  k8s objects from all environments. We do not touch the images

After finishing, you will be informed by a comment on the issue and the issue will be closed and marked as resolved.

# Restore Decommissioned App

If you followed the steps from [Decommission App](#decommission-app) and you want to restore it back, open a change request for the UNITY team (service: pdm-unity:global, service group: pdm-unity:devops:2nd) to recreate the cloud artifacts.

[Decommission App]: https://atc-github.azure.cloud.bmw/UNITY/unity/issues/new?assignees=&labels=decommission+app%2C+waiting+for+review&template=decommission-app.md&title=Decommission+UNITY+App
