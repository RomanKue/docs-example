import * as k8s from '@kubernetes/client-node';
import {CoreV1Api, HttpError, KubeConfig, RbacAuthorizationV1Api} from '@kubernetes/client-node';
import {base64Decode} from '../../strings/encoding.js';
import {ReadonlyDeep} from 'type-fest';
import {getInput} from '../../github/input.js';
import {assertUnreachable} from '../../run.js';
import {environments} from '../config.js';
import {constants} from 'http2';
import * as core from '@actions/core';

type Environment = typeof environments[keyof typeof environments];

const getCurrentNamespace = (kc: KubeConfig) => {
  const namespace = kc.getContextObject(kc.getCurrentContext())?.namespace;
  if (!namespace) {
    throw new Error(`namespace not set`);
  }
  return namespace;
};

const getName = (body: { metadata?: { name?: string } }) => {
  const name = body.metadata?.name;
  if (!name) {
    throw new Error(`name not set in ${body}`);
  }
  return name;
};

const getLabels = (name: string) => {
  return {
    'app.kubernetes.io/managed-by': 'unity',
    'app.kubernetes.io/name': name,
  };
};

/**
 * check for not found HTTP response
 */
const notFound = async <T>(cb: () => Promise<T>) => {
  try {
    return await cb();
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === constants.HTTP_STATUS_NOT_FOUND) {
      return false;
    }
    throw e;
  }
};

export const upsertServiceAccount = async (kc: KubeConfig, body: Parameters<CoreV1Api['createNamespacedServiceAccount']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  if (await notFound(async () => await coreV1API.readNamespacedServiceAccount(name, namespace))) {
    core.info(`replacing serviceaccount "${name}"`);
    await coreV1API.replaceNamespacedServiceAccount(name, namespace, body);
  } else {
    core.info(`creating serviceaccount "${name}"`);
    await coreV1API.createNamespacedServiceAccount(namespace, body);
  }
};

export const upsertSecret = async (kc: KubeConfig, body: Parameters<CoreV1Api['createNamespacedSecret']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  if (await notFound(async () => await coreV1API.readNamespacedSecret(name, namespace))) {
    core.info(`replacing secret "${name}"`);
    await coreV1API.replaceNamespacedSecret(name, namespace, body);
  } else {
    core.info(`creating secret "${name}"`);
    await coreV1API.createNamespacedSecret(namespace, body);
  }
};

export const upsertRole = async (kc: KubeConfig, body: Parameters<RbacAuthorizationV1Api['createNamespacedRole']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const rbacAuthorizationV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
  if (await notFound(async () => await rbacAuthorizationV1Api.readNamespacedRole(name, namespace))) {
    core.info(`replacing role "${name}"`);
    await rbacAuthorizationV1Api.replaceNamespacedRole(name, namespace, body);
  } else {
    core.info(`creating role "${name}"`);
    await rbacAuthorizationV1Api.createNamespacedRole(namespace, body);
  }
};

export const upsertRoleBinding = async (kc: KubeConfig, body: Parameters<RbacAuthorizationV1Api['createNamespacedRoleBinding']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const rbacAuthorizationV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
  if (await notFound(async () => await rbacAuthorizationV1Api.readNamespacedRoleBinding(name, namespace))) {
    core.info(`replacing rolebinding "${name}"`);
    await rbacAuthorizationV1Api.replaceNamespacedRoleBinding(name, namespace, body);
  } else {
    core.info(`updating rolebinding "${name}"`);
    await rbacAuthorizationV1Api.createNamespacedRoleBinding(namespace, body);
  }
};

const getKubeConfig = (environment: Environment) => {
  core.debug(`creating kubeconfig for environment "${environment}"`);
  const kc = new k8s.KubeConfig();
  switch (environment) {
  case 'int': {
    const host = getInput('INT_KUBERNETES_HOST');
    const namespace = getInput('INT_KUBERNETES_NAMESPACE');
    const token = getInput('INT_KUBERNETES_TOKEN');
    let server = host;
    if (!server.startsWith('https://')) {
      server = `https://${host}`;
    }
    kc.addCluster({name: environment, server: server, skipTLSVerify: true});
    kc.addUser({name: environment, token: token});
    kc.addContext({
      name: environment,
      namespace: namespace,
      cluster: environment,
      user: environment
    });
    break;
  }
  case 'prod': {
    const host = getInput('PROD_KUBERNETES_HOST');
    const namespace = getInput('PROD_KUBERNETES_NAMESPACE');
    const token = getInput('PROD_KUBERNETES_TOKEN');
    kc.addCluster({name: environment, server: `https://${host}`, skipTLSVerify: true});
    kc.addUser({name: environment, token: token});
    kc.addContext({
      name: environment,
      namespace: namespace,
      cluster: environment,
      user: environment
    });
    break;
  }
  default:
    core.error(`bad environment "${environment}"`);
    assertUnreachable(environment);
  }

  kc.setCurrentContext(environment);
  return kc;
};


export const readSecret = async (kc: KubeConfig, name: string) => {
  const namespace = getCurrentNamespace(kc);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  return await coreV1API.readNamespacedSecret(name, namespace);
};

export const createK8sObjects = async (
  environment: ReadonlyDeep<Environment>,
  repoName: string
): Promise<string> => {
  const kc = getKubeConfig(environment);
  await upsertSecret(kc, {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: repoName,
      labels: {
        ...getLabels(repoName),
      },
      annotations: {
        // see https://atc-github.azure.cloud.bmw/UNITY/unity-operator
        'unity-operator.unity.bmwgroup.net/disabled': 'true'
      }
    },
    type: 'net.bmwgroup.unity/app'
  });

  await upsertServiceAccount(kc, {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: repoName,
      labels: getLabels(repoName),
    }
  });

  await upsertRole(kc, {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: {
      name: repoName,
      labels: getLabels(repoName),
    },
    rules: [
      {
        apiGroups: [''],
        resources: ['secrets'],
        // cannot allow to create secret, see https://github.com/kubernetes/kubernetes/issues/80295
        verbs: ['get', 'patch', 'update', 'watch'],
        resourceNames: [repoName]
      }
    ]
  });

  await upsertRoleBinding(kc, {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: repoName,
      labels: getLabels(repoName),
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'Role',
      name: repoName,
    },
    subjects: [
      {
        kind: `ServiceAccount`,
        name: repoName,
        namespace: getCurrentNamespace(kc)
      }
    ]

  });

  const tokenSecretName = `${repoName}-service-account-token`;
  await upsertSecret(kc, {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: tokenSecretName,
      labels: getLabels(repoName),
      annotations:
        {'kubernetes.io/service-account.name': repoName}
    },
    type: 'kubernetes.io/service-account-token'
  });
  let base64Token: string | undefined;
  while (!base64Token) {
    const tokenSecret = await readSecret(kc, tokenSecretName);
    base64Token = tokenSecret.body?.data?.['token'];
  }
  return base64Decode(base64Token);
};
