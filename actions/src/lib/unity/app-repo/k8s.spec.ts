import * as k8s from './k8s.js';
import {createK8sObjects, deleteK8sObjects, getEnvironmentKubeConfig} from './k8s.js';
import {appEnvironments} from '../config.js';
import * as input from '../../github/input.js';
import {partialMock} from '../../mock/partial-mock.js';
import {ApiType, CoreV1Api, V1Secret} from '@kubernetes/client-node';
import {IncomingMessage} from 'http';
import {base64} from '../../strings/encoding.js';
import {expect, jest} from '@jest/globals';
import {RbacAuthorizationV1Api} from '@kubernetes/client-node/dist/gen/api/rbacAuthorizationV1Api.js';

describe('k8s.ts', () => {
  beforeEach(() => {
    jest.spyOn(input, 'getInput').mockImplementation((input) => {
      switch (input) {
      case 'INT_KUBERNETES_HOST':
        return 'kubernetes-api.apps.pdm-unity-int.azure.cloud.bmw';
      case 'INT_KUBERNETES_NAMESPACE':
        return 'pdm-unity-int';
      case 'INT_KUBERNETES_TOKEN':
        return 'eyJhbGciOiJSUzI1NiIsImtpZCI6IktJZ0R5bGdKdU80eXlBYXZxOUo5bGJiOUprVHJtRzZtdk9kUUJ1NzlsWkEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJwZG0tdW5pdHktaW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6InVuaXR5LWNoYXJ0LWhlbG0iLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoidW5pdHktY2hhcnQtaGVsbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjRlYTcwM2QzLTQxZGQtNDcxZi05ODczLWE0MGZkZTU2Yjk5MSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpwZG0tdW5pdHktaW50OnVuaXR5LWNoYXJ0LWhlbG0ifQ.S0oKSG2VOMdLNkdxxfp6c4NijIubQdt7UhcbZbC5bHvL7sZLbRJuc_PbMmDkFfa2b5QUsQxO_8n7JWQa3jBlGgckmqdSHBJB2rwln_Ra8z97Nw6uUG7-K77r2yRNcM4KEs0CWuT6jd_CXMqtpwyW2CGwQRip6R_9ahroe25F_yPKtsp-qV9A84tQFZCdplFXpT8PZib8HeSB1T2k2lMv0aIaFJ3cPAEYz3dz0UV4r2ebsYPp1Xytf7eP9dVcQ0s_okD-FoAs5xlIN4R4XoNhrW96yXD4t286WUcke_WdC0G2FmPbP1voRJ-NJZxzYSsyqk87DWflHG7zR5_hj2ULRTvCHf1oToZZuc5QSogfPxRyUtJ0N81HdtORwgcE2hQ4xw5yMD2Isp-BsFOjNCFrVgJA-qP16aA6BeY4wVhRMa0Oy_KGSZ4OvqTRyY31XbAe14moyp4CqdPIQobJYEMWDG8xG8-CfkyUP6Wc2O06cuOUxq1R6JrJhfEA4K3i623z5rVzkmSd--oq696KnPQgO2_wKUK4yOEqiXkR09BNEcqHaPvPpvV-rhCZAVvIXlOVsiHuZJMMK5A_mfZJrau_rWtCTq14PoBQsnyRG4ApYkrNDUDWJZwnWaUF48TT9inEx3GIF6Y2T_gU-c9IgZfoRxId6l5vVgt7Od5t9wa6yOg';
      }
      return '';
    });
  });
  describe('createK8sObjects', () => {
    beforeEach(() => {
      jest.spyOn(k8s, 'upsertRole').mockResolvedValue();
      jest.spyOn(k8s, 'upsertRoleBinding').mockResolvedValue();
      jest.spyOn(k8s, 'upsertSecret').mockResolvedValue();
      jest.spyOn(k8s, 'upsertServiceAccount').mockResolvedValue();
    });
    it('should create token when called', async () => {
      const v1Secret = partialMock<V1Secret>({data: {token: base64('foo-token')}});
      jest.spyOn(k8s, 'readSecret').mockResolvedValue(partialMock<{ response: IncomingMessage, body: V1Secret }>({
        body: v1Secret
      }));
      const token = await createK8sObjects(appEnvironments.int, 'foo', getEnvironmentKubeConfig(appEnvironments.int), undefined);
      expect(token).toEqual('foo-token');

      expect(k8s.upsertServiceAccount).toBeCalledTimes(1);
      expect(k8s.upsertRole).toBeCalledTimes(1);
      expect(k8s.upsertSecret).toBeCalledTimes(2);
      expect(k8s.upsertRoleBinding).toBeCalledTimes(1);
    });
  });

  describe('deleteK8sObjects', () => {
    it('should delete all K8s objects', async () => {
      const coreV1APIMock = {
        deleteCollectionNamespacedSecret: jest.fn(),
        deleteCollectionNamespacedServiceAccount: jest.fn()
      };
      const rbacAuthorizationV1ApiMock = {
        deleteCollectionNamespacedRoleBinding: jest.fn(),
        deleteCollectionNamespacedRole: jest.fn()
      };
      type ApiConstructor<T extends ApiType> = new (server: string) => T;
      const makeApiClientMock = (instanceType: ApiConstructor<ApiType>) => {
        const instance = new instanceType('');
        if (instance instanceof CoreV1Api) {
          return coreV1APIMock;
        }
        if (instance instanceof RbacAuthorizationV1Api) {
          return rbacAuthorizationV1ApiMock;
        }

        return null;
      };
      jest.spyOn(k8s, 'getEnvironmentKubeConfig').mockReturnValue({
        makeApiClient: makeApiClientMock,
        getCurrentContext: () => '',
        getContextObject: () => {return {namespace: appEnvironments.int};},
      } as never);
      const repoName = 'foo';
      await deleteK8sObjects(appEnvironments.int, repoName);

      expect(coreV1APIMock.deleteCollectionNamespacedSecret).toBeCalledTimes(1);
      expect(coreV1APIMock.deleteCollectionNamespacedSecret).toBeCalledWith(
        appEnvironments.int,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        `app.kubernetes.io/managed-by=unity,app.kubernetes.io/name=${repoName}`
      );
      expect(rbacAuthorizationV1ApiMock.deleteCollectionNamespacedRoleBinding).toBeCalledTimes(1);
      expect(rbacAuthorizationV1ApiMock.deleteCollectionNamespacedRole).toBeCalledTimes(1);
      expect(coreV1APIMock.deleteCollectionNamespacedServiceAccount).toBeCalledTimes(1);
    });
  });
});
