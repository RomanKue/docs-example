export interface AppSpec {
  /** field defining the API version, following the K8s concept of API versioning */
  apiVersion: string;
}

export interface AppSpecV1Beta1 extends AppSpec {
  apiVersion: 'v1beta1';
  name: string;
}

/**
 * type guard for {@link AppSpecV1Beta1}
 */
export const isV1Beta1 = (appSpec: AppSpec): appSpec is AppSpecV1Beta1 => {
  return (appSpec as AppSpecV1Beta1).apiVersion === 'v1beta1';
};

export interface AppSpecV1 extends AppSpec {
  apiVersion: 'v1';
  name: string;
}

/**
 * type guard for {@link AppSpecV1}
 */
export const isV1 = (appSpec: AppSpec): appSpec is AppSpecV1 => {
  return (appSpec as AppSpecV1).apiVersion === 'v1';
};
