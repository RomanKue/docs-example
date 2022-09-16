import {encrypt} from './repositories-utils.js';

describe('repository-utils.ts', () => {
  describe('encrypt', () => {
    it('should encrypt correctly when message and key is correct', () => {
      const key = 'KGscFtEk+wJMuH3+Jc4K9FaKgmOgq8gmpDu+MX6z0H8=';
      expect(encrypt('Hello World', key)).toBeTruthy();
    });
  });
});
