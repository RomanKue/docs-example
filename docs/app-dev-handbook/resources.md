# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Resources](#resources)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Resources

Compute resources, such as memory and CPU requirements for the app can be configured in the `unity-app.*.yaml` files.

```yaml
deployments:
  api:
    # ...
    container:
      resources:
        limits:
          cpuMillis: 100
          memoryMiB: 512
        requests:
          cpuMillis: 10
          memoryMiB: 128
```

An ideal config would set `requests` to as many resources as the app needs when being idle (e.g. a night) and
`limit` to as many resources as needed under full load. Setting resource correctly is non-trivial and the UNITY team may
provide additional tools in the future to get these numbers right.
Always keep in mind that high resource configuration will directly result in higher costs. So just setting everything to
the maximum may raise some questions.
