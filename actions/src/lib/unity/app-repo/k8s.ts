import * as k8s from '@kubernetes/client-node';
import {CoreV1Api, KubeConfig, RbacAuthorizationV1Api} from '@kubernetes/client-node';
import {base64Decode} from '../../strings/encoding.js';
import {ReadonlyDeep} from 'type-fest';
import {getInput} from '../../github/input.js';
import {assertUnreachable} from '../../run.js';
import {environments} from '../config.js';

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
    'app.kubernetes.io/component': name,
    'app.kubernetes.io/managed-by': 'unity',
    'app.kubernetes.io/name': name,
  };
};

export const upsertServiceAccount = async (kc: KubeConfig, body: Parameters<CoreV1Api['createNamespacedServiceAccount']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  if (!await coreV1API.readNamespacedServiceAccount(name, namespace)) {
    await coreV1API.createNamespacedServiceAccount(namespace, body);
  } else {
    await coreV1API.replaceNamespacedServiceAccount(name, namespace, body);
  }
};

export const upsertSecret = async (kc: KubeConfig, body: Parameters<CoreV1Api['createNamespacedSecret']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  if (!await coreV1API.readNamespacedSecret(name, namespace)) {
    await coreV1API.createNamespacedSecret(namespace, body);
  } else {
    await coreV1API.replaceNamespacedSecret(name, namespace, body);
  }
};

export const upsertRole = async (kc: KubeConfig, body: Parameters<RbacAuthorizationV1Api['createNamespacedRole']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const rbacAuthorizationV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
  if (!await rbacAuthorizationV1Api.readNamespacedRole(name, namespace)) {
    await rbacAuthorizationV1Api.createNamespacedRole(namespace, body);
  } else {
    await rbacAuthorizationV1Api.replaceNamespacedRole(name, namespace, body);
  }
};

export const upsertRoleBinding = async (kc: KubeConfig, body: Parameters<RbacAuthorizationV1Api['createNamespacedRoleBinding']>[1]) => {
  const namespace = getCurrentNamespace(kc);
  const name = getName(body);
  const rbacAuthorizationV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
  if (!await rbacAuthorizationV1Api.readNamespacedRoleBinding(name, namespace)) {
    await rbacAuthorizationV1Api.createNamespacedRoleBinding(namespace, body);
  } else {
    await rbacAuthorizationV1Api.replaceNamespacedRoleBinding(name, namespace, body);
  }
};

const getKubeConfig = (environment: Environment) => {
  const kc = new k8s.KubeConfig();
  switch (environment) {
  case 'int': {
    const host = getInput('INT_KUBERNETES_HOST');
    const namespace = getInput('INT_KUBERNETES_NAMESPACE');
    const token = getInput('INT_KUBERNETES_TOKEN');
    kc.addCluster({name: environment, server: `https://${host}`, skipTLSVerify: false});
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
    kc.addCluster({name: environment, server: `https://${host}`, skipTLSVerify: false});
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

export const createServiceAccount = async (
  environment: ReadonlyDeep<Environment>,
  name: string
): Promise<string> => {
  const kc = getKubeConfig(environment);
  await upsertServiceAccount(kc, {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name,
      labels: getLabels(name),
    }
  });

  await upsertRole(kc, {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: {
      name,
      labels: getLabels(name),
    },
    rules: [
      {
        apiGroups: [''],
        resources: ['secrets'],
        verbs: ['create', 'delete', 'get', 'patch', 'update', 'watch'],
        resourceNames: [name]
      }
    ]
  });

  await upsertRoleBinding(kc, {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name,
      labels: getLabels(name),
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'Role',
      name: name,
    }
  });

  await upsertSecret(kc, {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name,
      labels: getLabels(name),
      annotations:
        {'kubernetes.io/service-account.name': name}
    },
    type: 'kubernetes.io/service-account-token'
  });
  let base64Token: string | undefined;
  while (!base64Token) {
    const tokenSecret = await readSecret(kc, name);
    base64Token = tokenSecret.body?.data?.['token'];
  }
  return base64Decode(base64Token);
};
