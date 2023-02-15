import {recreateAppServiceAccount} from './recreate-app-service-account.js';

import * as k8s from '../lib/unity/app-repo/k8s.js';
import * as input from '../lib/github/input.js';
import {Inputs} from '../lib/github/input.js';
import * as repositories from '../lib/github/api/repos/repositories.js';
import {MinimalRepository} from '../lib/github/api/repos/response/minimal-repository.js';
import {repositoriesUtils} from '../lib/github/api/repos';
import {KubeConfig} from '@kubernetes/client-node';
import {jest} from '@jest/globals';
import {partialMock} from '../lib/mock/partial-mock';
import {githubSecretKeys} from '../lib/unity/config';

describe('recreate-app-service-account', () => {
  const kc = new KubeConfig();
  beforeEach(() => {
    jest.spyOn(k8s, 'createK8sObjects').mockResolvedValue('new-sa-token');
    jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue(
      createMockRepos(['app-test', 'not-an-app', 'app-foo'])
    );
    jest.spyOn(k8s, 'getKubeConfig').mockImplementation(() => kc);
    jest.spyOn(repositoriesUtils, 'createEnvironmentSecret').mockResolvedValue();
  });
  it('should not do anything when env is not valid', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('app-test', 'foo'));
    await recreateAppServiceAccount();

    expect(k8s.createK8sObjects).not.toHaveBeenCalled();
    expect(k8s.getKubeConfig).not.toHaveBeenCalled();
    expect(repositoriesUtils.createEnvironmentSecret).not.toHaveBeenCalled();
  });
  it('should not do anything when there is no matching repo', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('bar'));
    await recreateAppServiceAccount();

    expect(k8s.createK8sObjects).not.toHaveBeenCalled();
    expect(repositoriesUtils.createEnvironmentSecret).not.toHaveBeenCalled();
  });
  it('should be applied only against matching repos', async () => {
    jest.spyOn(input, 'getInput').mockImplementation(createMockInputs('^app-.*'));
    await recreateAppServiceAccount();

    expect(k8s.getKubeConfig).toHaveBeenCalledTimes(1);
    expect(k8s.getKubeConfig).toHaveBeenCalledWith('int', 'host', 'namespace', 'k8s-token');

    expect(k8s.createK8sObjects).toHaveBeenCalledTimes(2);
    expect(k8s.createK8sObjects).toHaveBeenCalledWith('int', 'app-test', kc);
    expect(k8s.createK8sObjects).toHaveBeenCalledWith('int', 'app-foo', kc);

    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledTimes(2);
    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledWith({id: 0}, 'int', githubSecretKeys.kubernetesToken, 'new-sa-token');
    expect(repositoriesUtils.createEnvironmentSecret).toHaveBeenCalledWith({id: 2}, 'int', githubSecretKeys.kubernetesToken, 'new-sa-token');
  });
});

const createMockRepos = (names: string[]) => {
  return names.map((name, index) => partialMock<MinimalRepository>({name: name, id: index}));
};

const createMockInputs = (repoRegex: string, env?: string) => {
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
    }
    return '';
  };
};
