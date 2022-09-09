import * as m from './make-stub.js';


describe('make-stub', () => {
  let repository: Parameters<typeof m.makeStub>[2];
  beforeEach(() => {
    repository = {
      name: 'app-foo',
      html_url: 'https://atc-github.azure.cloud.bmw/UNITY/non-existing-repo',
    };

    jest.spyOn(m, 'withErrorLogging').mockResolvedValue({stdout: '', stderr: ''});
  });
  describe('makeStub', () => {
    it('should make stub when type is angular', async () => {
      await m.makeStub('foo', 'angular', repository);
      expect(m.withErrorLogging).toHaveBeenCalled();
    });
  });
});
