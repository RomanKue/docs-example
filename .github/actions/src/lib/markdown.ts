import {Lexer} from 'marked';

export const lexMarkdown = (md: string): ReturnType<Lexer['lex']> => {
  const lexer = new Lexer({});
  const tokens = lexer.lex(md);
  return tokens;
}
