import {RequestError} from '@octokit/request-error';
import {getAUser} from './users.js';

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

