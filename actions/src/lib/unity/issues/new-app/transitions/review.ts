import {Issue} from '../../../../github/api/issues/response/issue.js';
import {loadSchema, NewAppIssue, parseIssueBody} from '../new-app-issue.js';
import * as core from '@actions/core';
import {IssueUtils} from '../../../../github/api/issues/issues.js';
import {validateSchema} from '../../../../json/json-schema.js';
import {magicComments} from '../../../config.js';
import {requestApproval} from './request-approval.js';
import {removeApprovalRequest} from './remove-approval-request.js';
import {RepoUtils} from '../../../../github/api/repos/repositories.js';
import {UserUtils} from '../../../../github/api/users/users.js';
import addSimpleComment = IssueUtils.addSimpleComment;

export const checkAppName = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app name: ${newAppIssue.appSpec?.name}`);
  if (await RepoUtils.isRepoExistent(newAppIssue.appSpec?.name)) {
    await addSimpleComment(issue, (user) =>
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
    for (let member of appSpec.members) {
      if (!await UserUtils.isUserExistent(member.qNumber)) {
        await addSimpleComment(issue, (user) =>
          `🚫 @${user} it seems that the user ${member.qNumber} cannot be found in GitHub. Please check the members in app specification.

            You can let me re-check by commenting \`${magicComments.check}\` on this issue.`
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
  core.info(`checking app yaml`);
  const apiVersion = newAppIssue.appSpec?.apiVersion;
  switch (apiVersion) {
  case 'v1beta1':
  case 'v1':
    const errors = validateSchema(newAppIssue.appSpec, loadSchema(apiVersion));
    if (errors) {
      await addSimpleComment(issue, (user) =>
        `❌ @${user} the app specification does not seem to fit our needs, please take a look at the following validation errors and update your issue, so I can proceed with your request.\n\n`
      );
      return false;
    }
    break;
  default:
    throw new Error(`got a bad api version: ${apiVersion}`);
  }
  return true;
};

export const checkTermsOfService = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking if terms of service are accepted`);
  if (!newAppIssue.termsOfServiceAccepted) {
    await addSimpleComment(issue, (user) =>
      `🚫 @${user} it seems that you did not agree to the terms of service yet. Could you please check and update your issue, so I can proceed with your request.`
    );
    return false;
  }
  return true;
};

export const reviewIssue = async (issue: Issue) => {
  core.info(`reviewing issue`);
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

