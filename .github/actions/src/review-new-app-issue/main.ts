/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from "@actions/core";
import {NewAppIssue, parseIssueBody} from './new-issue.js';
import {commentOnIssue, getIssue} from '../lib/octokit.js';
import {Issue} from '../lib/github/issue.js';

const checkAppSchema = (issue: Issue, newAppIssue: NewAppIssue) => {
}

const checkTermsOfService = (issue: Issue, newAppIssue: NewAppIssue) => {
  core.info(`checking if terms of service are accepted`)
  let userLogin = issue.user?.login;
  if (!newAppIssue.termsOfServiceAccepted) {
    commentOnIssue({body: `@${userLogin} it seems that you did not agree to the terms of service yet. Could you please check and update your issue, so I can proceed with your request.`})
  }
}

const assignIssue = (issue: Issue, newAppIssue: NewAppIssue) => {
}


const run = async () => {
  const issue = await getIssue();
  const newAppIssue = parseIssueBody(issue.body ?? '')

  checkTermsOfService(issue, newAppIssue)
  checkAppSchema(issue, newAppIssue)
  assignIssue(issue, newAppIssue)
}

run().catch(e => {
  if (e instanceof Error) {
    core.setFailed(e.message)
  } else {
    core.setFailed(e)
  }
})
