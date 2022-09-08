import {Issue} from '../../../../github/api/issues/response/issue.js';
import {loadSchema, NewAppIssue, parseIssueBody} from '../new-app-issue.js';
import * as core from '@actions/core';
import {validateSchema} from '../../../../json/json-schema.js';
import {magicComments, unityBot} from '../../../config.js';
import {requestApproval} from './request-approval.js';
import {removeApprovalRequest} from './remove-approval-request.js';
import {issuesUtils} from '../../../../github/api/issues/index.js';
import {repositoriesUtils} from '../../../../github/api/repos/index.js';
import {usersUtils} from '../../../../github/api/users/index.js';
import {getIssueState, issueState} from '../state.js';

export const checkAppName = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app name: ${newAppIssue.appSpec?.name}`);
  if (await repositoriesUtils.isRepoExistent(newAppIssue.appSpec?.name)) {
    await issuesUtils.addSimpleComment(issue, (user) =>
      `🚫 @${user} it seems that the name ${newAppIssue.appSpec?.name ?? ''} is already in use, please choose a different name.`
    );
    return false;
  }
  return true;
};

export const checkAppMembers = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  const appSpec = newAppIssue.appSpec;
  if (appSpec && 'members' in appSpec) {
    core.info(`checking app members: ${JSON.stringify(appSpec?.members)}`);
    for (const member of appSpec.members) {
      if (!await usersUtils.isUserExistent(member.qNumber)) {
        await issuesUtils.addSimpleComment(issue, (user) =>
          `🚫 @${user} it seems that the user ${member.qNumber} cannot be found in GitHub. Please check the members in app specification.

            You can let me re-check by commenting "@${unityBot} ${magicComments.review}" on this issue.`
        );
        return false;
      }
    }
  } else {
    core.warning(`no app members defined.`);
  }
  return true;
};


export const checkAppSchema = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app yaml on issue: ${issue.html_url}`);
  const apiVersion = newAppIssue.appSpec?.apiVersion;
  switch (apiVersion) {
  case 'v1beta1':
  case 'v1': {

    const errors = validateSchema(newAppIssue.appSpec, loadSchema(apiVersion));
    if (errors) {
      await issuesUtils.addSimpleComment(issue, (user) =>
        `❌ @${user} the app specification does not seem to fit our needs, please take a look at the following validation errors and update your issue, so I can proceed with your request.\n\n`
      );
      return false;
    }
    break;
  }
  default:
    throw new Error(`got a bad api version: ${apiVersion}`);
  }
  return true;
};

export const checkTermsOfService = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking if terms of service are accepted in issue: ${issue.html_url}`);
  if (!newAppIssue.termsOfServiceAccepted) {
    await issuesUtils.addSimpleComment(issue, (user) =>
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
  ok &&= await checkAppMembers(issue, newAppIssue);

  core.info(`all checks have been passed with: ${ok}`);
  if (ok) {
    await requestApproval(issue);
  } else {
    await removeApprovalRequest(issue);
  }
};
