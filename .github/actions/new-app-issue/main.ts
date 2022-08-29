/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from "@actions/core";

import * as github from "@actions/github";
import {octokit} from "./octokit.js";

const run = async () => {
  const issue = await octokit.rest.issues.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
    }
  );
  core.debug(`issue: ${issue.data}`)
  core.info(`hello world`)
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
