<!-- mermaid is currently not directly supported, see: https://pages.github.com/versions/ -->
<!-- as workaround use: https://jojozhuang.github.io/tutorial/jekyll-diagram-with-mermaid/-->
<!-- for latest version, check: https://unpkg.com/mermaid-->
<script type="text/javascript" src="https://unpkg.com/mermaid"></script>
<script>$(document).ready(function() { mermaid.initialize({ theme: 'neutral'}); });</script>

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Certificates](#certificates)
  - [Ingress](#ingress)
  - [Egress](#egress)
    - [UNITY App Services](#unity-app-services)
    - [Other Services](#other-services)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Certificates

Good news, UNITY handles all certificates for you!
This section clarifies how UNITY does that.

## Ingress

The following diagram illustrates TLS termination for ingress traffic:

<div class="mermaid">
graph TB
subgraph UNITY
    subgraph pod
        envoy-- HTTP request -->main
        main-- HTTP response -->envoy
    end
end
client-- HTTPS request -->envoy
envoy-- HTTPS response -->client
</div>

In this diagram, envoy terminates TLS traffic from the client and encrypts traffic with a certificate and key, provided
by UNITY. Traffic inside the pod can then be handled via plain HTTP. The application does not need to handle a
certificate key to encrypt traffic.

## Egress

The following diagram illustrates TLS termination for egress traffic:

<div class="mermaid">
graph TB
subgraph UNITY
    subgraph pod
        envoy-- HTTP response -->main
        main-- HTTP request -->envoy
    end
end
service-- HTTPS response -->envoy
envoy-- HTTPS request -->service
</div>

In this diagram, the app acts a client and calls the external service through envoy. Envoy has a trust store configured,
which contains all current certificate trusted in the BMW organisation. Certificates are validated using this trust
store. The app itself does not need to handle any trust stores or certificates.

### UNITY App Services

Unity integrates some services on port `8008`. This means, UNITY managed services can be called on that port. Here is an
example on how to do this in a Quarkus app:

`application.properties`

```properties
quarkus.rest-client.services.url=http://localhost:8008/services/api
```

`DevModelRangeSearch.java`
```java
@RegisterRestClient(configKey = "services")
@Consumes({MediaType.APPLICATION_JSON})
@Produces({MediaType.APPLICATION_JSON})
@Path("pip-vehicle/dev-model-ranges/v2:search")
public interface DevModelRangeSearch {

    @POST
    CompletionStage<PipSearchResultDO<DevModelRangeDO>> searchAsync(DevModelRangeSearchDO devModelRangeSearchDO);
}
```

### Other Services

To integrate other external services, the `unity-app.*.yaml` files need to be adjusted like shown below:

```yaml
deployments:
  api:
    # ...
    proxyPorts:
      9000:
        host:
          example.com
    replicas: 1
```

This proxy port config will allow to call `https://example.com` on `http://localhost:9000` from the app's container.
