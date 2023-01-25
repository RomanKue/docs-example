# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [External Services](#external-services)
  - [Developing Locally](#developing-locally)
  - [Calling External Services](#calling-external-services)
  - [Quarkus](#quarkus)
    - [REST Client](#rest-client)
    - [REST Resource](#rest-resource)
    - [Testing Locally](#testing-locally)
    - [Deploying to Int](#deploying-to-int)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# External Services

UNITY integrates some services from the PMD domain. By providing a reverse proxy integration of these services,
UNITY can handle authentication and authorization, which means calling a service from a container is as simple as

```bash
curl http://localhost:8008/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}'
```

The base URL is `http://localhost:8008/services/api`. The next segment of the URL is the service which needs to be
called (in this example, `pip-vehicle`).
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

Alternatively, a service account token can be used for authentication, which can be obtained via the `store-secrets`
workflow which is generated together with the application.
In addition, the custom header `Unity-Authorization-Type: Kubernetes-Service-Account` must be set as shown below.

```bash
curl https://unity-int.bmwgroup.net/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}' -H 'Authorization: Bearer <sa-token>' -H 'Unity-Authorization-Type: Kubernetes-Service-Account'
```

In this case, UNITY checks that the service account token is valid and will change the `Authorization` header to call
the external service. This is the most convenient way to call an external service.

## Quarkus

When developing a Quarkus application, it would be useful to be able to call the external services when developing
applications. In order to do that, the service account token is needed which can be obtained via the store-secrets
workflow.

The following section contains a ste«p-by-step guide to implement a service integration using PIP Vehicle as example.

### REST Client

Add the maven dependencies for the rest client to the `pom.xml`, as also described
in [USING THE REST CLIENT](https://quarkus.io/guides/rest-client).

```xml

<dependencies>
  <dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client</artifactId>
  </dependency>
  <dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client-jackson</artifactId>
  </dependency>
</dependencies>
```

The `quarkus-rest-client-jackson` dependency ensures that `records` are automatically mapped to JSON by
the [Jackson](https://github.com/FasterXML/jackson) framework.

Next create the REST client interface.

```java
@RegisterRestClient(configKey = "unity-services")
@Consumes({MediaType.APPLICATION_JSON})
@Produces({MediaType.APPLICATION_JSON})
@Path("/pip-vehicle/")
public interface PipVehicle {

    @POST
    @Path("/dev-model-ranges/v2:search")
    SearchResult<DevModelRange> searchDevModelRanges(DevModelRangeSearch request);

    record SearchResult<T>(List<T> result) {
    }

    record DevModelRange(String devModelRangeCode) {
    }

    record DevModelRangeSearch(List<String> devModelRangeCodes) {
    }
}
```

The `application.properties` should be extended by a few properties for local development

```properties
quarkus.rest-client.unity-services.url=http://localhost:8008/services/api
%dev.quarkus.rest-client.unity-services.url=https://unity-int.bmwgroup.net/services/api
%dev.quarkus.tls.trust-all=true
%dev.quarkus.log.category."org.apache.http".level=DEBUG
```

* `rest-client.unity-services.url` is the base URL of the service, which will be used by the client annotated
  with `@RegisterRestClient(configKey = "unity-services")`.
* `tls.trust-all=true` can be safely set on `dev`, to ignore certificate validation. In UNITY, certificates will
  properly be validated by the sidecar.
* `log.category."org.apache.http".level=DEBUG` this optional setting can be helpful to see requests in the logs.

### REST Resource

To use the client, create a simple rest resource, calling the service:

```java
@Path("/v1/")
public class PipResource {

    @Inject
    @RestClient
    PipVehicle pipVehicle;

    @GET
    @Path("pip/{code}")
    @Produces(MediaType.APPLICATION_JSON)
    public CompletionStage<PipVehicle.SearchResult<PipVehicle.DevModelRange>> devModelRange(
        @Parameter(hidden = true) @HeaderParam("Unity-UserName") final String userName,
        @PathParam("code") String code
    ) {
        return pipVehicle.searchDevModelRanges(new PipVehicle.DevModelRangeSearch(List.of(code)));
    }
}

```

### Testing Locally

In order to test the service integration locally, a client headers factory needs to be created.

```java
@ApplicationScoped
@IfBuildProfile("dev")
public class DevAuthorizationHeaderFactory implements ClientHeadersFactory {

  @ConfigProperty(name = "kubernetes-token")
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

This factory sets the `Authorization` and `Unity-Authorization-Type` headers on every request.
To use the factory in the REST client, annotate it with:

```java
@RegisterClientHeaders(DevAuthorizationHeaderFactory.class)
@RegisterRestClient(configKey = "unity-services")
@Consumes({MediaType.APPLICATION_JSON})
@Produces({MediaType.APPLICATION_JSON})
@Path("/pip-vehicle/")
public interface PipVehicle {
  // ...
}
```

When starting Quarkus locally the `KUBERNETES_TOKEN` environment variable needs to be set.

In IntelliJ, this can be set in the run configuration under **Runner > Environment variables**.

![run-config.png](..%2Fassets%2Frun-config.png)

The token can be downloaded after running the `store-secrets` action in your repository.

![store-secrets.png](..%2Fassets%2Fstore-secrets.png)

After the action has completed successfully, the `secrets.yaml` file can be downloaded from the **Summary > Artifacts**
section.

![store-secrets-result.png](..%2Fassets%2Fstore-secrets-result.png)

Copy the token from the `secrets.yaml` to the `KUBERNETES_TOKEN` environment variable.

⚠️ Never add the token to your source code, this is confidential information, which should not be shared in plain text.

After the environment was configured correctly, start Quarkus and call the endpoint:

```bash
curl -X GET "http://localhost:8080/my-app/api/v1/pip/G20"
```

This should result in the following JSON response:

```json
{
  "result": [
    {
      "devModelRangeCode": "G20"
    }
  ]
}
```

If the response is not properly JSON formatted, make sure the following dependency is in your `pom.xml`, as this takes
care of mapping the response `record` to JSON.

```xml

<dependency>
  <groupId>io.quarkus</groupId>
  <artifactId>quarkus-resteasy-reactive-jackson</artifactId>
</dependency>
```

### Deploying to Int

Next, deploy your code to `int` and enjoy UNITY 🚀.
