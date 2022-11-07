# [Envoy](https://www.envoyproxy.io)

Envoy proxy is used in unity to proxy all traffic going in and out of the app's main container by following the service
mesh pattern.

The config for envoy is part of
the [unity-app](https://atc-github.azure.cloud.bmw/UNITY/unity-helm-charts/tree/main/charts/unity-app) helm chart.

# Testing Locally

The simplest setup is to run envoy as docker container locally using docker or podman.
Alternatively, is also possible to install envoy directly on the machine by following
the [official docs](https://www.envoyproxy.io/docs/envoy/latest/start/install).

Since the config would require adjustments when running envoy outside a container, the following steps will show how to
run envoy locally in a container only.

To run the same config as in a pod of an app, set the config of an app to analyze by defining the following env
variables.

```bash
NAME=ebr
DEPLOYMENT=api
```

Next, create a local tmp folder and dump the envoy config to file.

```bash
kubectl get secret app-$NAME-$DEPLOYMENT-tls -ojson | jq -r '.data["tls.crt"] | @base64d'  > tls.crt
kubectl get secret app-$NAME-$DEPLOYMENT-tls -ojson | jq -r '.data["tls.key"] | @base64d'  > tls.key
kubectl get secret app-$NAME-bmw-certificates -ojson | jq -r '.data["ca.crt"] | @base64d'  > ca.crt
kubectl get cm app-$NAME-$DEPLOYMENT-envoy-config -ojson | jq -r '.data["config.yaml"]' > config.yaml
```

Now run envoy (use `docker` instead of `podman` if you prefer docker).

```bash
podman run \
  --mount type=bind,src=$(pwd)/ca.crt,target=/var/run/secrets/unity.bmwgroup.net/ca/ca.crt \
  --mount type=bind,src=$(pwd)/tls.crt,target=/var/run/secrets/unity.bmwgroup.net/tls/tls.crt \
  --mount type=bind,src=$(pwd)/tls.key,target=/var/run/secrets/unity.bmwgroup.net/tls/tls.key \
  --mount type=bind,src=$(pwd)/config.yaml,target=/var/run/secrets/unity.bmwgroup.net/envoy/config.yaml \
  --env ENVOY_UID=0 \
  -p 8000-8079:8000-8079 \
  docker.io/envoyproxy/envoy:v1.24.0 \
  -c /var/run/secrets/unity.bmwgroup.net/envoy/config.yaml \
  --log-level debug
```

Now, open the admin console in the local browser: [http://localhost:8003](http://localhost:8003).
Or try with curl:

```bash
curl http://localhost:8004/auth -i
```

If [authz](https://atc-github.azure.cloud.bmw/UNITY/authz) is running locally, this should respond with:

```text
HTTP/1.1 302 Found
Location: https://unity-test.bmwgroup.net/oauth2-proxy/oauth2/start?rd=https%3A%2F%2Flocalhost%3A8001%2F
content-length: 0
```
