import {syncMasterKeys} from './sync-master-keys.js';

import * as k8s from '../../lib/unity/app-repo/k8s';
import * as input from '../../lib/github/input';
import {Inputs} from '../../lib/github/input';
import * as search from '../../lib/github/api/search/search';
import * as actionsUtils from '../../lib/github/api/actions/actions-utils';
import {repositoriesUtils} from '../../lib/github/api/repos';
import {KubeConfig} from '@kubernetes/client-node';
import {jest} from '@jest/globals';
import {partialMock} from '../../lib/mock/partial-mock';
import {githubSecretKeys, k8sSecretConstants} from '../../lib/unity/config';
import {RepoSearchResultItem} from '../../lib/github/api/search/response/repo-search-result-item';

describe('sync-master-keys', () => {
  const kc = new KubeConfig();
  const k8MasterKey = 'k8-master-key';
  beforeEach(() => {
    jest.spyOn(search, 'searchRepositories').mockResolvedValue(
      createMockRepos(['app-test', 'not-an-app', 'app-foo'])
    );
    jest.spyOn(k8s, 'getKubeConfig').mockImplementation(() => kc);
    jest.spyOn(k8s, 'readSecretForEnvironment').mockResolvedValue(k8MasterKey);
    jest.spyOn(actionsUtils, 'isSecretExistent').mockResolvedValue(true);
    jest.spyOn(repositoriesUtils, 'createEnvironmentSecret').mockResolvedValue();
  });
  it('should not do anything when env is not valid', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('app-test', 'true', 'foo'));
    await syncMasterKeys();

    expect(actionsUtils.isSecretExistent).not.toHaveBeenCalled();
    expect(k8s.getKubeConfig).not.toHaveBeenCalled();
    expect(k8s.readSecretForEnvironment).not.toHaveBeenCalled();
    expect(repositoriesUtils.createEnvironmentSecret).not.toHaveBeenCalled();
  });
  it('should not do anything when there is no matching repo', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('bar', 'true'));
    await syncMasterKeys();

    expect(actionsUtils.isSecretExistent).not.toHaveBeenCalled();
    expect(k8s.getKubeConfig).not.toHaveBeenCalled();
    expect(k8s.readSecretForEnvironment).not.toHaveBeenCalled();
    expect(repositoriesUtils.createEnvironmentSecret).not.toHaveBeenCalled();
  });
  it('should be applied only against matching repos', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-.*', 'true'));
    await syncMasterKeys();

    expect(k8s.getKubeConfig).toHaveBeenCalledTimes(1);
    expect(k8s.getKubeConfig).toHaveBeenCalledWith('int', 'host', 'namespace', 'k8s-token');

    expect(k8s.readSecretForEnvironment).toHaveBeenCalledTimes(2);
    expect(k8s.readSecretForEnvironment).toHaveBeenCalledWith(kc, `app-test${k8sSecretConstants.masterKeySuffix}`, k8sSecretConstants.masterKey);
    expect(k8s.readSecretForEnvironment).toHaveBeenCalledWith(kc, `app-foo${k8sSecretConstants.masterKeySuffix}`, k8sSecretConstants.masterKey);

    expect(actionsUtils.isSecretExistent).toHaveBeenCalledTimes(2);
    expect(actionsUtils.isSecretExistent).toHaveBeenCalledWith({
      repository_id: 0,
      environment_name: 'int',
      secret_name: githubSecretKeys.cryptMasterKey
    });
    expect(actionsUtils.isSecretExistent).toHaveBeenCalledWith({
      repository_id: 2,
      environment_name: 'int',
      secret_name: githubSecretKeys.cryptMasterKey
    });

    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledTimes(2);
    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledWith({id: 0}, 'int', githubSecretKeys.cryptMasterKey, k8MasterKey);
    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledWith({id: 2}, 'int', githubSecretKeys.cryptMasterKey, k8MasterKey);
  });
  it('should overwrite only if flag is set to true', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-test$', 'false'));
    await syncMasterKeys();

    expect(actionsUtils.isSecretExistent).toHaveBeenCalledTimes(1);
    expect(repositoriesUtils.createEnvironmentSecret).not.toHaveBeenCalled();
  });
  it('should set if secret does not exist even if overwrite is false', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-test$', 'false'));
    jest.spyOn(actionsUtils, 'isSecretExistent').mockResolvedValue(false);
    await syncMasterKeys();

    expect(actionsUtils.isSecretExistent).toHaveBeenCalledTimes(1);
    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledTimes(1);
    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledWith({id: 0}, 'int', githubSecretKeys.cryptMasterKey, k8MasterKey);
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
