import * as yaml from 'js-yaml';
import {repos} from './config.js';
import {ReadonlyDeep} from 'type-fest';

export interface ApiVersioned {
  apiVersion: string;
}

export interface AppDeployment {
  replicas?: number;
  oauth2?: {
    enabled: boolean
  };
  container?: {
    image: string
    tag: string
    tmpDirs?: string[]
    capabilities?: string[]
    runAsUser?: number
  };
}

export interface AppSpecV1Beta1 extends ApiVersioned {
  /** field defining the API version, following the K8s concept of API versioning */
  apiVersion: 'v1beta1';
  name: string;
  deployments?: Record<string, AppDeployment>;
}

/**
 * type guard for {@link AppSpecV1Beta1}
 */
export const isV1Beta1 = (appSpec: ReadonlyDeep<AppSpec>): appSpec is AppSpecV1Beta1 => {
  return (appSpec as AppSpecV1Beta1).apiVersion === 'v1beta1';
};

export interface AppSpecV1 extends ApiVersioned {
  apiVersion: 'v1';
  name: string;
  deployments: string[];
}

/**
 * type guard for {@link AppSpecV1}
 */
export const isV1 = (appSpec: AppSpec): appSpec is AppSpecV1 => {
  return (appSpec as AppSpecV1).apiVersion === 'v1';
};

export type AppSpec = AppSpecV1Beta1 | AppSpecV1

/**
 * parse yaml into {@link AppSpec}. Note that this function does not validate the schema of the yaml
 */
export const parseYaml = (s: string): AppSpec => {
  return yaml.load(s) as AppSpec;
};

/**
 * generate the name of the repository from the app name
 */
export const repoName = (appName: string | null | undefined): string => {
  if (!appName) {
    return '';
  }
  return repos.appPrefix + appName;
};

export const imageName = (appName: string | null | undefined, deploymentName: string): string => {
  return `${repoName(appName)}-${deploymentName}`;
};
