import {lexMarkdown} from './markdown';
import {marked} from 'marked';
import Heading = marked.Tokens.Heading;

describe('markdown', () => {
  describe('lexMarkdown', () => {
    it('should lex markdown when there is a heading', () => {
      const ast = lexMarkdown('# Foo');
      expect(ast).toBeTruthy()
      expect(ast[0].type).toEqual('heading')
      let heading = ast[0] as Heading;
      expect(heading.text).toEqual('Foo')
    });
  });
});
