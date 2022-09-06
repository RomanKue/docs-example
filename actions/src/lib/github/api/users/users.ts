import {RestApi} from '../rest.js';
import {getOctokitApi} from '../../octokit.js';
import {PrivateUser, PublicUser} from './response/user.js';
import {RequestError} from '@octokit/request-error';

type UsersApi = RestApi['users'];

/**
 * see https://docs.github.com/en/rest/users/users#get-a-user
 */
export const getAUser = async (
  options: { username: string } & Partial<Parameters<UsersApi['getByUsername']>[0]>
): Promise<PrivateUser | PublicUser> => {
  const response = await getOctokitApi().rest.users.getByUsername({
    ...options
  });
  return response.data as PrivateUser | PublicUser;
};

export namespace UserUtils {
  export const isUserExistent = async (qNumber: string) => {
    try {
      await getAUser({username: qNumber});
      return true;
    } catch (e) {
      if (e instanceof RequestError && e.status === 404) {
        return false;
      }
      throw e;
    }
  };
}

