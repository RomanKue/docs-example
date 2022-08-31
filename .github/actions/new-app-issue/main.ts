/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from "@actions/core";

import * as github from "@actions/github";
import {octokit} from "../lib/octokit.js";
import {marked} from 'marked';
import {Issue} from "../lib/github/issue.js";

const run = async () => {
  const response = await octokit.rest.issues.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
    }
  );
  const issue = response.data as Issue;
  core.debug(`issue: ${response}`)

  core.info(`${JSON.stringify(issue, null, 2)}`)

  const lexer = new marked.Lexer({});
  const tokens = lexer.lex(issue.body ?? '');

  core.info(`${JSON.stringify(issue, null, 2)}`)
}

run().catch(e => {
  if (e instanceof Error) {
    core.setFailed(e.message)
  } else {
    core.setFailed(e)
  }
})

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput('who-to-greet');
//   core.info(`Hello ${nameToGreet}!`);
//   const time = (new Date()).toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2)
//   core.info(`The event payload: ${payload}`);
// } catch (error) {
//   if (error instanceof Error) core.setFailed(error.message)
// }
//
