import * as k8s from '@kubernetes/client-node';
import {CoreV1Api, HttpError, KubeConfig, RbacAuthorizationV1Api} from '@kubernetes/client-node';
import {base64Decode} from '../../strings/encoding.js';
import {ReadonlyDeep} from 'type-fest';
import {getInput, IssueUpdatedInputs} from '../../github/input.js';
import {assertUnreachable} from '../../run.js';
import {allEnvironments, appEnvironments, k8sSecretConstants} from '../config.js';
import {constants} from 'http2';
import * as core from '@actions/core';

type AppEnvironment = typeof appEnvironments[keyof typeof appEnvironments];
type Environment = typeof allEnvironments[keyof typeof allEnvironments];

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

const getLabelsAsFilterString = (name: string): string => {
  return Object.entries(getLabels(name)).map(entry => entry.join('=')).join(',');
};

/**
 * check for not found HTTP response
 */
const exists = async <T>(cb: () => Promise<T>) => {
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
  if (await exists(async () => await coreV1API.readNamespacedServiceAccount(name, namespace))) {
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
  if (await exists(async () => await coreV1API.readNamespacedSecret(name, namespace))) {
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
  if (await exists(async () => await rbacAuthorizationV1Api.readNamespacedRole(name, namespace))) {
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
  if (await exists(async () => await rbacAuthorizationV1Api.readNamespacedRoleBinding(name, namespace))) {
    core.info(`replacing rolebinding "${name}"`);
    await rbacAuthorizationV1Api.replaceNamespacedRoleBinding(name, namespace, body);
  } else {
    core.info(`updating rolebinding "${name}"`);
    await rbacAuthorizationV1Api.createNamespacedRoleBinding(namespace, body);
  }
};

export const getKubeConfig = (environment: Environment, host: string, namespace: string, token: string): KubeConfig => {
  let server = host;
  if (!server.startsWith('https://')) {
    server = `https://${host}`;
  }

  const kc = new k8s.KubeConfig();
  kc.addCluster({
    name: environment,
    server: server,
    skipTLSVerify: false,
    caFile: '/etc/ssl/certs/ca-certificates.crt',
  });
  kc.addUser({name: environment, token: token});
  kc.addContext({
    name: environment,
    namespace: namespace,
    cluster: environment,
    user: environment
  });
  kc.setCurrentContext(environment);
  return kc;
};

export const getEnvironmentKubeConfig = (environment: AppEnvironment): KubeConfig => {
  core.debug(`creating kubeconfig for environment "${environment}"`);
  switch (environment) {
  case 'int': {
    const host = getInput<IssueUpdatedInputs>('INT_KUBERNETES_HOST');
    const namespace = getInput<IssueUpdatedInputs>('INT_KUBERNETES_NAMESPACE');
    const token = getInput<IssueUpdatedInputs>('INT_KUBERNETES_TOKEN');
    return getKubeConfig(environment, host, namespace, token);
  }
  case 'prod': {
    const host = getInput<IssueUpdatedInputs>('PROD_KUBERNETES_HOST');
    const namespace = getInput<IssueUpdatedInputs>('PROD_KUBERNETES_NAMESPACE');
    const token = getInput<IssueUpdatedInputs>('PROD_KUBERNETES_TOKEN');
    return getKubeConfig(environment, host, namespace, token);
  }
  default:
    core.error(`bad environment "${environment}"`);
    return assertUnreachable(environment);
  }
};

export const readSecretForEnvironment = async (kubeConfig: KubeConfig, secretName: string, secretKey: string) => {
  const tokenSecret = await readSecret(kubeConfig, secretName);
  const base64Token = tokenSecret?.body?.data?.[secretKey];
  if (!base64Token) {
    throw new Error(`Secret key ${secretKey} in secret ${secretName} is not set in environment
      ${getCurrentNamespace(kubeConfig)}.`);
  }
  return base64Decode(base64Token);
};

export const readSecret = async (kc: KubeConfig, name: string) => {
  const namespace = getCurrentNamespace(kc);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  try {
    return await coreV1API.readNamespacedSecret(name, namespace);
  } catch (e) {
    if (e instanceof HttpError && e.statusCode == 404) {
      core.warning(`Secret ${name} is not set in environment ${namespace}`);
      return null;
    }
    throw e;
  }
};

export const readServiceAccountToken = async (environment: ReadonlyDeep<AppEnvironment>, repoName: string) => {
  const kc = getEnvironmentKubeConfig(environment);
  const secret = await readSecret(kc, `${repoName}-service-account-token`);
  const base64Token = secret?.body?.data?.['token'] ?? '';
  return base64Decode(base64Token);
};

export const upsertMasterKeySecretV2 = async (kubeConfig: KubeConfig, repoName: string, masterKey: string) => {
  await upsertSecret(kubeConfig, {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: `${repoName}${k8sSecretConstants.masterKeyV2Suffix}`,
      labels: {
        ...getLabels(repoName),
      },
    },
    type: 'Opaque',
    stringData: {
      'master-key': masterKey
    }
  });
};

export const createK8sObjects = async (
  environment: ReadonlyDeep<Environment>,
  repoName: string,
  kubeConfig: KubeConfig,
  masterKey: string | undefined
): Promise<string> => {
  if (masterKey) {
    await upsertMasterKeySecretV2(kubeConfig, repoName, masterKey);
  }

  await upsertSecret(kubeConfig, {
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

  await upsertServiceAccount(kubeConfig, {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: repoName,
      labels: getLabels(repoName),
    }
  });

  await upsertRole(kubeConfig, {
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
        resourceNames: [
          repoName,
          `${repoName}${k8sSecretConstants.masterKeyV1Suffix}`,
          `${repoName}${k8sSecretConstants.masterKeyV2Suffix}`,
        ]
      }
    ]
  });

  await upsertRoleBinding(kubeConfig, {
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
        namespace: getCurrentNamespace(kubeConfig)
      }
    ]

  });

  const tokenSecretName = getTokenSecretName(repoName);
  await upsertSecret(kubeConfig, {
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
    const tokenSecret = await readSecret(kubeConfig, tokenSecretName);
    base64Token = tokenSecret?.body?.data?.['token'];
  }
  return base64Decode(base64Token);
};

export const deleteK8sObjects = async (
  environment: keyof typeof appEnvironments,
  repoName: string
): Promise<void> => {
  const kubeConfig = getEnvironmentKubeConfig(environment);
  core.info(`Deleting k8s objects from ${repoName} ${kubeConfig.getCurrentContext()} environment`);

  const namespace = getCurrentNamespace(kubeConfig);
  const coreV1API = kubeConfig.makeApiClient(k8s.CoreV1Api);
  const rbacAuthorizationV1Api = kubeConfig.makeApiClient(k8s.RbacAuthorizationV1Api);

  type DeleteParametersType = [string, string | undefined, string | undefined, string | undefined, string | undefined, number | undefined, string];

  const deleteParameters: DeleteParametersType = [
    namespace, // namespace
    undefined, // pretty
    undefined, // _continue
    undefined, // dryRun
    undefined, // fieldSelector
    undefined, // gracePeriodSeconds
    getLabelsAsFilterString(repoName) // labelSelector
  ];

  await coreV1API.deleteCollectionNamespacedSecret(...deleteParameters);
  await rbacAuthorizationV1Api.deleteCollectionNamespacedRoleBinding(...deleteParameters);
  await rbacAuthorizationV1Api.deleteCollectionNamespacedRole(...deleteParameters);
  await coreV1API.deleteCollectionNamespacedServiceAccount(...deleteParameters);
};

export const getTokenSecretName = (repoName: string): string => {
  return `${repoName}-service-account-token`;
};
