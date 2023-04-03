import {Issue} from '../../../../github/api/issues/response/issue.js';
import {loadSchema, NewAppIssue, parseIssueBody} from '../new-app-issue.js';
import * as core from '@actions/core';
import {validateSchema} from '../../../../json/json-schema.js';
import {requestApproval} from './request-approval.js';
import {removeApprovalRequest} from './remove-approval-request.js';
import {issuesUtils} from '../../../../github/api/issues/index.js';
import {repositoriesUtils} from '../../../../github/api/repos/index.js';
import {getIssueState, issueState} from '../../issue-state.js';

export const checkAppName = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app name: ${newAppIssue.appSpec?.name}`);
  if (await repositoriesUtils.isRepoExistent(newAppIssue.appSpec?.name)) {
    await issuesUtils.addSimpleComment(issue, user =>
      `🚫 @${user} it seems that the name ${newAppIssue.appSpec?.name ?? ''} is already in use, please choose a different name.`
    );
    return false;
  }
  return true;
};

export const checkAppSchema = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app yaml on issue: ${issue.html_url}`);
  // only fields provided by the user are checked
  const errors = validateSchema({...newAppIssue.appSpec, environment: 'int'}, await loadSchema());
  if (errors) {
    await issuesUtils.addSimpleComment(issue, user =>
      `❌ @${user} the app specification does not seem to fit our needs, ` +
      `please take a look at the following validation errors and update your issue, ` +
      `so I can proceed with your request.\n\n` +
      `${errors}`
    );
    return false;
  }
  return true;
};

export const checkTermsOfService = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking if terms of service are accepted in issue: ${issue.html_url}`);
  if (!newAppIssue.termsOfServiceAccepted) {
    await issuesUtils.addSimpleComment(issue, user =>
      `🚫 @${user} it seems that you did not agree to the terms of service yet. Could you please check and update your issue, so I can proceed with your request.`
    );
    return false;
  }
  return true;
};

export const reviewIssue = async (issue: Issue) => {
  if (getIssueState(issue) !== issueState.waitingForReview) {
    return;
  }
  core.info(`reviewing issue: ${issue.html_url}`);
  const newAppIssue = parseIssueBody(issue.body ?? '');

  let ok = true;

  ok &&= await checkTermsOfService(issue, newAppIssue);
  ok &&= await checkAppSchema(issue, newAppIssue);
  ok &&= await checkAppName(issue, newAppIssue);

  core.info(`all checks have been passed with: ${ok}`);
  if (ok) {
    await requestApproval(issue);
  } else {
    await removeApprovalRequest(issue);
  }
};

