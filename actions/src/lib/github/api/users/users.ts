import {RestApi} from '../rest.js';
import {getOctokit} from '../../octokit.js';
import {PrivateUser, PublicUser} from './response/user.js';

type UsersApi = RestApi['users'];

/**
 * see https://docs.github.com/en/rest/users/users#get-a-user
 */
export const getAUser = async (
  options: { username: string } & Partial<Parameters<UsersApi['getByUsername']>[0]>
): Promise<PrivateUser | PublicUser> => {
  const response = await getOctokit().rest.users.getByUsername({
    ...options
  });
  return response.data as PrivateUser | PublicUser;
};

