import {base64} from './encoding.js';

describe('encoding', () => {
  describe('base64', () => {
    it('should endode when called', () => {
      expect(base64('Hello World')).toEqual('SGVsbG8gV29ybGQ=');
    });
  });
});
