import * as yaml from 'js-yaml';
import {repos} from './config.js';
import {listOrganizationRepositories} from '../github/api/repos/repositories.js';

export interface ApiVersioned {
  apiVersion: string;
}

export interface AppSpecV1Beta1 extends ApiVersioned {
  /** field defining the API version, following the K8s concept of API versioning */
  apiVersion: 'v1beta1';
  name: string;
}

/**
 * type guard for {@link AppSpecV1Beta1}
 */
export const isV1Beta1 = (appSpec: AppSpec): appSpec is AppSpecV1Beta1 => {
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

export const isRepoExistent = async (appName: string | null | undefined): Promise<boolean> => {
  const newAppRepoName = repoName(appName);

  const repositories = await listOrganizationRepositories();
  return repositories.map(r => r.name).includes(newAppRepoName);
};
