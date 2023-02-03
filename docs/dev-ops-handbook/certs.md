---
layout: default
title: Certs
parent: DevOps Handbook
nav_order: 3
---

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Certs](#certs)
  - [Architecture](#architecture)
  - [TLS](#tls)
  - [How to Inspect Certificates](#how-to-inspect-certificates)
  - [Client to Ingress Controller](#client-to-ingress-controller)
  - [Ingress Controller to Pod](#ingress-controller-to-pod)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Certs

Unity does all certificate handling for an app. This means an app developer may develop an entire back-end without
ever needing to touch a certificate or trust store.

## Architecture

In UNITY all HTTP traffic is encrypted via TLS. Encryption is handled by different certificates, as outlined below:

* Client to ingress controller
* Ingress controller to Pod

The sections below outline the details.

## TLS

When an end-user opens a UNITY app's UI in the web browser, they call an URL like `https://unity.bmwgroup.net/foo/ui`.
The request is handled by the ingress controller of the Kubernetes cluster, which also terminates TLS.

The ingress controller is configured via
an [`Ingress`](https://kubernetes.io/docs/concepts/services-networking/ingress/) object, configured via the
[unity-app](https://atc-github.azure.cloud.bmw/UNITY/unity-helm-charts/tree/main/charts/unity-app) Helm chart.

The [nginx ingress controller](https://github.com/kubernetes/ingress-nginx) can be configured
via [annotations](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md)
to handle TLS correctly.

All ingress objects MUST have the following annotations set:

```yaml
nginx.ingress.kubernetes.io/backend-protocol: HTTPS
nginx.ingress.kubernetes.io/proxy-ssl-name: "<service name>.<namespace>.svc.cluster.local"
nginx.ingress.kubernetes.io/proxy-ssl-secret: "<namespace>/<secret name>"
nginx.ingress.kubernetes.io/proxy-ssl-verify: "on"
```

These annotations make sure TLS is terminated by the ingress controller and re-encrypted on the upstream.
To terminate TLS using a certificate that is signed by a BMW certificate authority,
the [cert-manager](https://cert-manager.io) is employed.

The cert manager handles a [`Certificate`](https://cert-manager.io/docs/usage/certificate/) CRD, which instructs the
cert manager to generate a certificate and store it in a secret.

Additional info can be found in
the [4WHEELS MANAGED](https://developer.bmwgroup.net/docs/4wheels-managed/applications_integration/certificates/)
documentation.

Upstream traffic from the ingress controller to the pod is handled by a self-signed certificate.

This simplifies the setup w.r.t certificate rotation. Since the cert manager may generate a new certificate at a certain
point in time, it must be made sure that the new key is handled correctly by the pods mounting the key.
The ingress controller can pick up new certificates keys automatically. As soon as a new certificate key is present in
the secret, it will serve traffic using the new certificate key.

On the other hand, a pod serving traffic may not be capable to handle a new certificate at runtime. Hence, a self-signed
certificate with almost infinite validity (100 years) is used to encrypt traffic from the ingress controller to the pod.
This is as secure as any other certificate, since the certificate is never used outside the cluster and no third party
is required to trust the self-signed certificate.

The self-signed certificate is generated via the
[unity-app](https://atc-github.azure.cloud.bmw/UNITY/unity-helm-charts/tree/main/charts/unity-app) Helm chart.

In the pod, TLS is terminated by an [envoy proxy](https://www.envoyproxy.io).
Configuration of the envoy proxy is part of the
[unity-app](https://atc-github.azure.cloud.bmw/UNITY/unity-helm-charts/tree/main/charts/unity-app) Helm chart as well.
Finally, the envoy proxy passes traffic on to the app's main container within the pod without encryption via HTTP.
By terminating TLS on the envoy, the app's main container does not need to handle any certificates or secrets.

## How to Inspect Certificates

When something breaks, it is important to know, how to inspect the various certificates.

When the ingress controller stops to serve traffic, one reason can be in issue with the certificate configuration.
The first step for troubleshooting should be inspecting the logs in Grafana Loki:

![](../assets/Loki-SSL-certificate-veryfy-error-Screenshot.png)

Next, the certificates can be inspected locally as follows.

## Client to Ingress Controller

To inspect the setup of an app, set the config of an app to analyze by defining the following env variables

```bash
NAME=<name of the app, e.g. services>
DEPLOYMENT=<name of the deployment, e.g. api>
```

```bash
kubectl get certificate -oyaml app-$NAME
```

The certificates can be dumped from the secret where the cert manager places them as follows.

```bash
SECRET_NAME=$(kubectl get certificate -ojson app-$NAME | jq -r '.spec.secretName')
echo $SECRET_NAME
kubectl get secret $SECRET_NAME -ojson | jq -r '.data["tls.key"] | @base64d'  > ingress-tls.key
kubectl get secret $SECRET_NAME -ojson | jq -r '.data["tls.crt"] | @base64d'  > ingress-tls.crt
```

Employing `openssl`, the content can be displayed:

```bash
cat ingress-tls.crt | openssl x509 -noout -text -certopt no_header,no_version,no_serial,no_signame,no_issuer,no_pubkey,no_sigdump,no_aux
```

The certificate can be checked with:

```bash
CRT_MD5=$(openssl x509 -noout -modulus -in ingress-tls.crt | openssl md5)
KEY_MD5=$(openssl rsa -noout -modulus -in ingress-tls.key | openssl md5)
echo $CRT_MD5
echo $KEY_MD5
echo "diff:"
diff <(echo "$CRT_MD5") <(echo "$KEY_MD5")
```

## Ingress Controller to Pod

TLS from the ingress controller to the service (pod) is handled by a different certificate, which can be dumped as
follows.

```bash
SECRET_NAME=app-$NAME-$DEPLOYMENT-tls
echo $SECRET_NAME
kubectl get secret $SECRET_NAME -ojson | jq -r '.data["tls.key"] | @base64d'  > svc-tls.key
kubectl get secret $SECRET_NAME -ojson | jq -r '.data["tls.crt"] | @base64d'  > svc-tls.crt
cat svc-tls.crt | openssl x509 -noout -text -certopt no_header,no_version,no_serial,no_signame,no_issuer,no_pubkey,no_sigdump,no_aux
```

```bash
CRT_MD5=$(openssl x509 -noout -modulus -in svc-tls.crt | openssl md5)
KEY_MD5=$(openssl rsa -noout -modulus -in svc-tls.key | openssl md5)
echo $CRT_MD5
echo $KEY_MD5
echo "diff:"
diff <(echo "$CRT_MD5") <(echo "$KEY_MD5")
```

The ingress controller should trust this certificate, which is configured in the following annotation:

```bash
kubectl get ingress app-$NAME-$DEPLOYMENT -ojson | jq -r '.metadata.annotations["nginx.ingress.kubernetes.io/proxy-ssl-secret"]'
```

It is also crucial that `nginx.ingress.kubernetes.io/proxy-ssl-verify` is set to `on`
and `nginx.ingress.kubernetes.io/proxy-ssl-name` is set to a value in the certificate. This can be validated with:

```bash
SNI=$(kubectl get ingress app-$NAME-$DEPLOYMENT -ojson | jq -r '.metadata.annotations["nginx.ingress.kubernetes.io/proxy-ssl-name"]')
cat svc-tls.crt | openssl x509 -noout -text -certopt no_header,no_version,no_serial,no_signame,no_issuer,no_pubkey,no_sigdump,no_aux | grep $SNI
```

It needs to be made sure that the pod is serving traffic with the certificate from the secret (and not using an
outdated certificate).
This can be done by mapping the port of the service to localhost

```bash
kubectl port-forward svc/app-$NAME-$DEPLOYMENT 8000:8000
```

Then, in a separate shell connect to the mapped port and dump the served certificate:

```bash
echo -e '
GET /#/Methods HTTP/1.1
Host: localhost
Connection: Close
' |
openssl s_client -showcerts -connect localhost:8000 2>&1 |
grep -A 1000 'BEGIN CERTIFICATE' |
grep -B 1000 'END CERTIFICATE' > tls.crt
```

Make sure the served certificate is that same as the one from secret:

```bash
diff --ignore-blank-lines tls.crt svc-tls.crt
```

If this results in a diff, the pod is serving an outdated certificate, which the ingress controller will not accept.

Finally, it may still be possible, that one of the pods backing the service is serving the correct certificate and
another one does not. To make sure, map the port of the individual pods instead of mapping the service port and repeat
the certificate validation.
