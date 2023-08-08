import {Tokens} from 'marked';
import {lexMarkdown} from './markdown.js';

describe('markdown', () => {
  describe('lexMarkdown', () => {
    it('should lex markdown when there is a heading', () => {
      const ast = lexMarkdown('# Foo');
      expect(ast).toBeTruthy();
      expect(ast[0].type).toEqual('heading');
      const heading = ast[0] as Tokens.Heading;
      expect(heading.text).toEqual('Foo');
    });
  });
});
