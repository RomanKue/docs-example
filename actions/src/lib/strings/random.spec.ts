import {randomCryptoString} from './random.js';

describe('random', () => {
  describe('randomCryptoString', () => {
    it('should generate in correct length', () => {
      expect(randomCryptoString(32)).toHaveLength(32);
    });
  });
});
