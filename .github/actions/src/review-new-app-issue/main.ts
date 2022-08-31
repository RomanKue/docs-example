/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from "@actions/core";
import {NewAppIssue, parseIssueBody} from './new-issue.js';
import {getIssue} from '../lib/octokit.js';


const checkAppSchema = (newAppIssue: NewAppIssue) => {
}

const checkTermsOfService = (newAppIssue: NewAppIssue) => {
  if (!newAppIssue.termsOfServiceAccepted) {
  }
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
