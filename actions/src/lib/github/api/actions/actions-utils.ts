import {listEnvironmentSecrets} from './actions.js';

export const isSecretExistent = async (
  options: {
    repository_id: number,
    environment_name: string,
    secret_name: string,
  }): Promise<boolean> => {
  return (await listEnvironmentSecrets(options)).map(as => as.name).includes(options.secret_name);
};
