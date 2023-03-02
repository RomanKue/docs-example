import {syncMasterKeysFromV1ToV2} from './sync-master-keys-from-v1-to-v2.js';

import * as k8s from '../../lib/unity/app-repo/k8s.js';
import * as input from '../../lib/github/input.js';
import {Inputs} from '../../lib/github/input.js';
import * as search from '../../lib/github/api/search/search.js';
import * as actionsUtils from '../../lib/github/api/actions/actions-utils.js';
import {KubeConfig, V1Secret} from '@kubernetes/client-node';
import {partialMock} from '../../lib/mock/partial-mock.js';
import {k8sSecretConstants} from '../../lib/unity/config.js';
import {RepoSearchResultItem} from '../../lib/github/api/search/response/repo-search-result-item.js';
import {IncomingMessage} from 'http';
import {base64} from '../../lib/strings/encoding.js';
import {jest} from '@jest/globals';

describe('sync-master-keys-from-v1-to-v2', () => {
  const kc = new KubeConfig();
  const k8MasterKey = 'k8-master-key';
  beforeEach(() => {
    jest.spyOn(k8s, 'createK8sObjects').mockResolvedValue('token-string');
    jest.spyOn(search, 'searchRepositories').mockResolvedValue(
      createMockRepos(['app-test', 'not-an-app', 'app-foo'])
    );
    jest.spyOn(k8s, 'getKubeConfig').mockImplementation(() => kc);
    const v1Secret = partialMock<V1Secret>({data: {'master-key': base64('foo-token')}});
    jest.spyOn(k8s, 'readSecret').mockResolvedValue(partialMock<{ response: IncomingMessage, body: V1Secret }>({
      body: v1Secret
    }));
    jest.spyOn(k8s, 'readSecretForEnvironment').mockResolvedValue(k8MasterKey);
    jest.spyOn(actionsUtils, 'isSecretExistent').mockResolvedValue(true);
  });
  it('should not do anything when env is not valid', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('app-test', 'true', 'foo'));
    await syncMasterKeysFromV1ToV2();

    expect(k8s.getKubeConfig).not.toHaveBeenCalled();
    expect(k8s.readSecretForEnvironment).not.toHaveBeenCalled();
  });
  it('should not do anything when there is no matching repo', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('bar', 'true'));
    await syncMasterKeysFromV1ToV2();

    expect(actionsUtils.isSecretExistent).not.toHaveBeenCalled();
    expect(k8s.getKubeConfig).not.toHaveBeenCalled();
    expect(k8s.readSecretForEnvironment).not.toHaveBeenCalled();
    expect(k8s.createK8sObjects).not.toHaveBeenCalled();
  });
  it('should be applied only against matching repos', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-.*', 'true'));
    await syncMasterKeysFromV1ToV2();

    expect(k8s.getKubeConfig).toHaveBeenCalledTimes(1);
    expect(k8s.getKubeConfig).toHaveBeenCalledWith('int', 'host', 'namespace', 'k8s-token');

    expect(k8s.readSecretForEnvironment).toHaveBeenCalledTimes(2);
    expect(k8s.readSecretForEnvironment).toHaveBeenCalledWith(kc, `app-test${k8sSecretConstants.masterKeyV1Suffix}`, k8sSecretConstants.masterKey);
    expect(k8s.readSecretForEnvironment).toHaveBeenCalledWith(kc, `app-foo${k8sSecretConstants.masterKeyV1Suffix}`, k8sSecretConstants.masterKey);
  });
  it('should overwrite only if flag is set to true', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-test$', 'false'));
    await syncMasterKeysFromV1ToV2();
    expect(k8s.createK8sObjects).not.toHaveBeenCalled();
  });
  it('should set if secret does not exist even if overwrite is false', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-test$', 'false'));
    const v1Secret = partialMock<V1Secret>({data: {'master-key': base64('foo-token')}});
    jest.spyOn(k8s, 'readSecret').mockResolvedValueOnce(partialMock<{ response: IncomingMessage, body: V1Secret }>({
      body: v1Secret
    }));
    jest.spyOn(k8s, 'readSecret').mockResolvedValueOnce(null);
    await syncMasterKeysFromV1ToV2();
    expect(k8s.createK8sObjects).toHaveBeenCalledTimes(1);
  });
});

const createMockRepos = (names: string[]) => {
  return names.map((name, index) => partialMock<RepoSearchResultItem>({name: name, id: index}));
};

const createMockInputs = (repoRegex: string, overwrite: string, env?: string) => {
  return (input: Inputs) => {
    switch (input) {
    case 'repository-regex':
      return repoRegex;
    case 'environment':
      return env ? env : 'int';
    case 'KUBERNETES_HOST':
      return 'host';
    case 'KUBERNETES_NAMESPACE':
      return 'namespace';
    case 'KUBERNETES_TOKEN':
      return 'k8s-token';
    case 'overwrite':
      return overwrite;
    }
    return '';
  };
};
