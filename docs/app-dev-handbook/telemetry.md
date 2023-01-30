# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Telemetry](#telemetry)
  - [Logging](#logging)
    - [Search in Logs](#search-in-logs)
    - [Live Logs](#live-logs)
  - [Metrics](#metrics)
  - [Tracing](#tracing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Telemetry

Telemetry data jointly refers to logs, metrics, traces and other diagnostic data of your app.

## Logging

Application logs can be accessed in Grafana:

* [Grafana int](https://unity-int.bmwgroup.net/grafana/)
* [Grafana](https://unity.bmwgroup.net/grafana/)

In the **Explore** tab, logs can be searched by selecting **Loki** as datasource.

![](../assets/explore-loki.png)

### Search in Logs

Logs can be search using [LogQL](https://grafana.com/docs/loki/latest/logql/).

![](../assets/loki-logs.png)

Here are a few examples to start with:

* Select logs for the `app-test`'s `api` component from the `main` container:
  ```
  {app="app-test", component="api", container="main"}
  ```
* Find logs containing the word `NullPointerException` in the logs
  ```
  {app="app-test", component="api", container="main"} |= `NullPointerException`
  ```
* Select logs for multiple containers:
  ```
  {app="app-test", component="api", container=~"main|authz|envoy"}
  ```
* Select logs by querying a json property (works with JSON logs only)
  ```
  {app="app-test", component="api", container=~"main"} | json | level="WARN"
  ```
* Print only part of a JSON log entry:
  ```
  {app="app-test", component="api", container=~"main"} | json | line_format "{{.message}}"
  ```

### Live Logs

To follow logs of an app's component, select the relevant logs by label and click the **Live** button, the logs will
update automatically.

<video autoplay loop width=801>
  <source src="../assets/live-logs.mov" type="video/mp4">
Your browser does not support the video tag.
</video>

## Metrics

Application metrics can be accessed in Grafana:

* [Grafana int](https://unity-int.bmwgroup.net/grafana/)
* [Grafana](https://unity.bmwgroup.net/grafana/)

In the **Explore** tab, metrics be explored by selecting **Prometheus** as datasource.

![](../assets/explore-prometheus.png)

Metrics can be explored using [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).

Here are a few examples to start with:

* Select the `up` metric and sum by component:
  ```
  sum (up{app="app-test"}) by (component)
  ```

## Tracing

Tracing is not available yet.
