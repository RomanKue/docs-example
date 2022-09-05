import {isKebabCase} from './case-conventions.js';

describe('case-conventions', () => {
  describe('isKebabCase', () => {
    it('should be true when test string is kebab case', () => {
      expect(isKebabCase('a')).toBeTruthy();
      expect(isKebabCase('abc')).toBeTruthy();
      expect(isKebabCase('abc-abc')).toBeTruthy();
    });
    it('should be false when test string is empty', () => {
      expect(isKebabCase('')).toBeFalsy();
    });
    it('should be false when test string contains upper case', () => {
      expect(isKebabCase('A')).toBeFalsy();
    });
    it('should be false when test string starts with dash', () => {
      expect(isKebabCase('-a')).toBeFalsy();
    });
    it('should be false when test string ends with dash', () => {
      expect(isKebabCase('a-')).toBeFalsy();
    });
    it('should be false when test string contains invalid tokens', () => {
      expect(isKebabCase('a/b')).toBeFalsy();
    });
  });
});
