import {RequestError} from '@octokit/request-error';
import {ActionsApi, getAnEnvironmentSecret} from './actions.js';

export const isSecretExistent = async (
  options: {
    repository_id: number,
    environment_name: string,
    secret_name: string,
  } & Partial<Parameters<ActionsApi['getEnvironmentSecret']>[0]>
) => {
  try {
    await getAnEnvironmentSecret(options);
    return true;
  } catch (e) {
    if (e instanceof RequestError && e.status === 404) {
      return false;
    }
    throw e;
  }
};
