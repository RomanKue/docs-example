import { getCurrentNamespace, getEnvironmentKubeConfig } from '../lib/unity/app-repo/k8s.js';
import { environments } from '../lib/unity/config.js';
import * as k8s from '@kubernetes/client-node';
import * as core from '@actions/core';
import { run } from '../lib/run.js';

const testK8sConnection = async () => {
  const kc = getEnvironmentKubeConfig(environments.int);
  const namespace = getCurrentNamespace(kc);
  const coreV1API = kc.makeApiClient(k8s.CoreV1Api);
  const serviceAccount = await coreV1API.readNamespacedServiceAccount('app-test', namespace);
  core.info(`see service account "${JSON.stringify(serviceAccount)}"`);
};

run(testK8sConnection);
