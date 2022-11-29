import {base64, base64Decode} from './encoding.js';

describe('encoding', () => {
  describe('base64', () => {
    it('should encode when called', () => {
      expect(base64('Hello World')).toEqual('SGVsbG8gV29ybGQ=');
    });
  });
  describe('base64Decode', () => {
    it('should decode when called', () => {
      expect(base64Decode(base64('Hello World'))).toEqual('Hello World');
    });
  });
});
