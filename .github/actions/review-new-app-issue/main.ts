/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from "@actions/core";
import {getIssue} from "../lib/octokit.js";
import {marked} from 'marked';
import Lexer = marked.Lexer;

class NewAppIssue {

}
export const parseIssueBody = (body: string): NewAppIssue => {
  const tokens = lexMarkdown(body);

  // TODO
  return new NewAppIssue();
}

const lexMarkdown = (md: string): ReturnType<Lexer['lex']> => {
  const lexer = new marked.Lexer({});
  const tokens = lexer.lex(md);
  return tokens;
}

const checkAppSchema = (newAppIssue: NewAppIssue) => {
}

const checkTermsOfService = (newAppIssue: NewAppIssue) => {
}

const assignIssue = (newAppIssue: NewAppIssue) => {
}


const run = async () => {
  const issue = await getIssue();
  const newAppIssue = parseIssueBody(issue.body ?? '')

  checkTermsOfService(newAppIssue)
  checkAppSchema(newAppIssue)
  assignIssue(newAppIssue)
}

run().catch(e => {
  if (e instanceof Error) {
    core.setFailed(e.message)
  } else {
    core.setFailed(e)
  }
})
