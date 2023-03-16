import {encrypt} from './repositories-utils.js';
import {repositoriesUtils} from './index';
import {FileCommit} from './response/file-commit';

describe('repository-utils.ts', () => {
  describe('encrypt', () => {
    it('should encrypt correctly when message and key is correct', () => {
      const key = 'KGscFtEk+wJMuH3+Jc4K9FaKgmOgq8gmpDu+MX6z0H8=';
      expect(encrypt('Hello World', key)).toBeTruthy();
    });

    describe('upsertFile', () => {
      it('should call create when file does not exist', async () => {
        jest.spyOn(repositoriesUtils, 'isContentExistent').mockResolvedValue(false);
        const addFileSpy = jest.spyOn(repositoriesUtils, 'addFile').mockImplementation(async () => await {} as Promise<FileCommit>);
        await repositoriesUtils.upsertFile('test', 'ui', 'test');
        expect(addFileSpy).toHaveBeenCalledTimes(1);
      });

      it('should call create when file exists', async () => {
        jest.spyOn(repositoriesUtils, 'isContentExistent').mockResolvedValue(true);
        const updateFileSpy = jest.spyOn(repositoriesUtils, 'updateFile').mockImplementation(async () => await {} as Promise<FileCommit>);
        await repositoriesUtils.upsertFile('test', 'ui', 'test');
        expect(updateFileSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
