<!-- mermaid is currently not directly supported, see: https://pages.github.com/versions/ -->
<!-- as workaround use: https://jojozhuang.github.io/tutorial/jekyll-diagram-with-mermaid/-->
<!-- for latest version, check: https://unpkg.com/mermaid-->
<script type="text/javascript" src="https://unpkg.com/mermaid"></script>
<script>$(document).ready(function() { mermaid.initialize({ theme: 'neutral'}); });</script>

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Profiling and Debugging](#profiling-debugging)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# JMX Profiling

It is possible to start JMX profiling for applications running on the UNITY cluster:

```console
$ helm upgrade app-services ./charts/unity-app --set global.main.jmxremote.enabled=true,global.main.jmxremote.port=10500 -n int --reuse-values
```
If not specified, the default port will be 10500.

After the application started, it is possible to do a port-forwarding on port 10500:

```console
$ kubectl port-forward app-services-api-799696f469-p9wcm 10500:10500 -n int
```

For profiling the application, different profilers can be used. An example which comes together with the JDK is Visual VM,
which can be started by running the command jvisualvm (provided that the JDK is in the Path).

# Remote debugging

It is possible to perform remote debugging on an application running in the UNITY cluster:

```console
$ helm upgrade app-services ./charts/unity-app --set global.main.remoteDebug.enabled=true,global.main.remoteDebug.port=10500 -n int --reuse-values
```
If not specified, the default port will be 10500.

After the application started, it is possible to do a port-forwarding on port 10500:

```console
$ kubectl port-forward app-services-api-799696f469-p9wcm 10500:10500 -n int
```

Afterwards it is possible to start a remote debugger in IntelliJ and connect to localhost:10500.
