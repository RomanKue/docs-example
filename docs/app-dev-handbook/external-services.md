# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [External Services](#external-services)
  - [Developing Locally](#developing-locally)
  - [Calling External Services](#calling-external-services)
  - [Quarkus](#quarkus)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# External Services

UNITY integrates some services from the PMD domain. By providing a reverse proxy integration of these services,
UNITY can handle authentication and authorization, which means calling a service from a container is as simple as

```bash
curl http://localhost:8008/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}'
```

The base URL is http://localhost:8008/services/api. The next segment of the URL is the service which needs to be
called (in this example, pip-vehicle).
The rest of the URL is the exact path on the external service. The request body is sent to the external service as is.

Here is a list of available services

* `http://localhost:8008/services/api/pip-vehicle` PIP Vehicle
* `http://localhost:8008/services/api/logic-services`
  [Logic Services (Logikdienste)](https://pmd.bmwgroup.net/lexicon/app/term/LGCS)
* `http://localhost:8008/services/api/pdm-core`
* `http://localhost:8008/services/api/puk`
  [Check and Configuration Service (Prüf- und Konfigurationsdienst, PUK)](https://pmd.bmwgroup.net/lexicon/app/term/PUK)
* `http://localhost:8008/services/api/hsa`
  [HSA (100% Sonderausstattung)](https://pmd.bmwgroup.net/lexicon/app/term/HSA)

## Developing Locally

## Calling External Services

External services can be called via a direct link provided by UNITY as shown in the example below:

```bash
curl https://unity-int.bmwgroup.net/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}' -H 'Authorization: Bearer <token>'
```

The base URL (on int) is `https://unity-int.bmwgroup.net/services/api/`.
The next segment of the URL is the service which needs to be called (in this example, `pip-vehicle`).
The rest of the URL is the exact path on the external service. The request body is sent to the external service as is.

However, in this case a valid `Authorization` header needs to be set (for example a WEN token where the user has the
necessary roles if the service uses WEN). If the header is set, it will be directly passed to the service,
without UNITY making any changes to the header.

Alternatively, a service account token can be used for authentication, which can be obtained via the store-secrets
workflow which is generated together with the application.
In addition, the custom header `Unity-Authorization-Type: Kubernetes-Service-Account` must be set as shown below.

```bash
curl https://unity-int.bmwgroup.net/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}' -H 'Authorization: Bearer <sa-token>' -H 'Unity-Authorization-Type: Kubernetes-Service-Account'
```

In this case, UNITY checks that the service account token is valid and will change the `Authorization` header to call
the external service. This is the most conveninet way to call an external service.

## Quarkus

When developing a Quarkus application, it would be useful to be able to call the external services when developing
applications. In order to do that, the service account token is
needed which can be obtained via the store-secrets workflow.

The following steps are required to develop locally:

- create a headers factory which sets the `Authorization` and `Unity-Authorization-Type` header:

```java
@ApplicationScoped
@IfBuildProfile("dev")
public class DevK8sSaAuthorizationHeaderFactory implements ClientHeadersFactory {

  @ConfigProperty(name = "sa-token")
  String saToken;

  @Override
  public MultivaluedMap<String, String> update(
      final MultivaluedMap<String, String> incomingHeaders,
      final MultivaluedMap<String, String> clientOutgoingHeaders) {
      clientOutgoingHeaders.put(AUTHORIZATION, List.of("Bearer " + saToken));
      clientOutgoingHeaders.put("Unity-Authorization-Type", List.of("Kubernetes-Service-Account"));
      return clientOutgoingHeaders;
  }
}
```

- this headers factory needs to be used in the REST client:

```java
@RegisterRestClient(configKey="puk")
@RegisterClientHeaders(DevK8sSaAuthorizationHeaderFactory.class)
public interface PukService {

    @POST
    @Path("{subPath:.*}")
    CompletionStage<Response> post(byte[] body, @PathParam("subPath") String path);

    @GET
    @Path("{subPath:.*}")
    CompletionStage<Response> get(@PathParam("subPath") String path);
}
```

- service configuration for dev:

```properties
%dev.quarkus.rest-client.puk.url=https://unity-int.bmwgroup.net/services/api/puk
```

For local development it is safe to disable SSL, in order to avoid any certificate errors:

```properties
%dev.quarkus.tls.trust-all=true
```

In this case, when starting Quarkus the `SA_TOKEN` environment variable needs to be initialized with the value of the
service account token.

