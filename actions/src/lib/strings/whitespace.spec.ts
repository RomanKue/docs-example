import {trimEmptyLines} from './whitespace.js';

describe('whitespace', () => {
  describe('trimEmptyLines', () => {
    it('should remove empty lines when called', () => {
      expect(trimEmptyLines(`foo

      bar`)).toEqual(`foo
      bar`);
    });
  });
});
