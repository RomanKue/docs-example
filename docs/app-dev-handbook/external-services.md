# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# External interfaces

UNITY allows the connection to a number of services over REST calls. In this case, UNITY acts as a proxy for the external services.
The authentication and authorization is done by the UNITY platform.

An example on how to call external services from a pod running inside the cluster is the following:

```bash
curl http://localhost:8008/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}'
```
The base URL is http://localhost:8008/services/api. The next segment of the URL is the service which needs to be called (in this example, pip-vehicle).
The rest of the URL is the exact path on the external service.
The body of the request will be forwarded to the external service. No Authorization header is necessary to be set in this situation.

For a list of all supported services, please address to the UNITY team.

# Calling external interfaces over direct link

External services can be called via a direct link provided by UNITY:

```bash
curl https://unity-int.bmwgroup.net/services/api/pip-vehicle/dev-model-ranges/v2:search -d '{}' -H 'Authorization: Bearer <token>'
```
The base URL should be in this case https://unity-int.bmwgroup.net/services/api.
The next segment of the URL is the service which needs to be called (in this example, pip-vehicle).
The rest of the URL is the exact path on the external service. The request body will be forwarded also in this case to the external service.

However, in this case a valid Authorization header needs to be set. This can be either a WEN token where the user has the necessary roles,
or a service account token, which can be obtained via the store-secrets workflow which is generated together with the application.

# Developing locally applications which call the external services

It would be useful to be able to call the external services when developing applications. In order to do that, the service account token is
needed which can be obtained via the store-secrets workflow. If the application is running on Quarkus, the following changes need to be done:

- create a headers factory which sets the Authorization header:
```java
@ApplicationScoped
@IfBuildProfile("dev")
public class DevK8sSaAuthorizationHeaderFactory implements ClientHeadersFactory {

  @ConfigProperty(name = "sa-token")
  String saToken;

  @Override
  public MultivaluedMap<String, String> update(MultivaluedMap<String, String> downstreamHeaders, MultivaluedMap<String, String> upstreamHeaders) {
    upstreamHeaders.put("Authorization", List.of("Bearer " + saToken));
    upstreamHeaders.put("Unity-Authorization-Type", List.of("Kubernetes-Service-Account"));
    return upstreamHeaders;
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

In this case, when starting Quarkus the SA_TOKEN environment variable needs to be initialized with the value of the service account token.

