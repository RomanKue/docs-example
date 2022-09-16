import * as k8s from './k8s.js';
import {createServiceAccount} from './k8s.js';
import {environments} from '../config.js';
import * as input from '../../github/input.js';
import {partialMock} from '../../mock/partial-mock.js';
import {V1Secret} from '@kubernetes/client-node';
import {IncomingMessage} from 'http';
import {base64} from '../../strings/encoding.js';

describe('k8s.ts', () => {
  beforeEach(() => {
    jest.spyOn(input, 'getInput').mockImplementation((input) => {
      switch (input) {
      case 'INT_KUBERNETES_HOST':
        return 'kubernetes-api.apps.pdm-unity-int.azure.cloud.bmw';
      case 'INT_KUBERNETES_NAMESPACE':
        return 'pdm-unity-int';
      case 'INT_KUBERNETES_TOKEN':
        return 'eyJhbGciOiJSUzI1NiIsIm...';
      }
      return '';
    });
    jest.spyOn(k8s, 'upsertRole').mockResolvedValue();
    jest.spyOn(k8s, 'upsertRoleBinding').mockResolvedValue();
    jest.spyOn(k8s, 'upsertSecret').mockResolvedValue();
    jest.spyOn(k8s, 'upsertServiceAccount').mockResolvedValue();
  });
  describe('createServiceAccount', () => {
    it('should create token when called', async () => {
      const v1Secret = partialMock<V1Secret>({data: {token: base64('foo-token')}});
      jest.spyOn(k8s, 'readSecret').mockResolvedValue(partialMock<{ response: IncomingMessage, body: V1Secret }>({
        body: v1Secret
      }));
      const token = await createServiceAccount(environments.int, 'foo');
      expect(token).toEqual('foo-token');

      expect(k8s.upsertServiceAccount).toBeCalledTimes(1);
      expect(k8s.upsertRole).toBeCalledTimes(1);
      expect(k8s.upsertSecret).toBeCalledTimes(1);
      expect(k8s.upsertRoleBinding).toBeCalledTimes(1);
    });
  });
});
