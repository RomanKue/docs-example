import users from '../../github/api/users/index.js';
import * as m from './make-stub.js';
import {partialMock} from '../../mock/partial-mock.js';
import {PrivateUser, PublicUser} from '../../github/api/users/response/user.js';


describe('make-stub', () => {
  let repository: Parameters<typeof m.makeStub>[2];
  beforeEach(() => {
    repository = {
      name: 'app-foo',
      html_url: 'https://atc-github.azure.cloud.bmw/UNITY/non-existing-repo',
    };

    jest.spyOn(m, 'withErrorLogging').mockResolvedValue({stdout: '', stderr: ''});
    jest.spyOn(users, 'getAUser').mockResolvedValue(partialMock<PrivateUser | PublicUser>({login: 'foo'}));
  });
  describe('makeStub', () => {
    it('should make stub when type is angular', async () => {
      await m.makeStub('foo', 'angular', repository);
      expect(m.withErrorLogging).toHaveBeenCalled();
    });
  });
});
