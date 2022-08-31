import {Lexer, marked} from 'marked';

export const lexMarkdown = (md: string): ReturnType<Lexer['lex']> => {
  const lexer = new marked.Lexer({});
  const tokens = lexer.lex(md);
  return tokens;
}
