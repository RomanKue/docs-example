/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';
import {
  hasLabel,
  isClosed,
  loadSchema,
  NewAppIssue,
  parseIssueBody
} from '../../lib/unity/custom-issues/new-app-issue.js';
import {
  addAssigneesToAnIssue,
  addLabelsToAnIssue,
  commentOnIssue,
  getIssue,
  removeALabelFromAnIssue,
  removeAssigneesFromAnIssue
} from '../../lib/github/api/issues/issues.js';
import {Issue} from '../../lib/github/api/issues/response/issue.js';
import {listMembersInOrg} from '../../lib/github/api/teams/teams.js';
import {labels, magicComments, teams} from '../../lib/unity/config.js';
import {isRepoExistent} from '../../lib/unity/app-spec.js';
import {validateSchema} from '../../lib/json-schema.js';
import {getAUser} from '../../lib/github/api/users/users.js';
import {RequestError} from '@octokit/request-error';
import * as github from '@actions/github';
import {IssueComment} from '../../lib/github/api/issues/response/issue-comment.js';


const checkAppSchema = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app yaml`);
  const apiVersion = newAppIssue.appSpec?.apiVersion;
  switch (apiVersion) {
  case 'v1beta1':
  case 'v1':
    const errors = validateSchema(newAppIssue.appSpec, loadSchema(apiVersion));
    if (errors) {
      let userLogin = issue.user?.login;
      let body = `❌ @${userLogin} the app specification does not seem to fit our needs, please take a look at the following validation errors and update your issue, so I can proceed with your request.\n\n`;
      body += errors;
      commentOnIssue({body});
      return false;
    }
    break;
  default:
    throw new Error(`got a bad api version: ${apiVersion}`);
  }
  return true;
};

const checkTermsOfService = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking if terms of service are accepted`);
  let userLogin = issue.user?.login;
  if (!newAppIssue.termsOfServiceAccepted) {
    commentOnIssue({
      body:
        `🚫 @${userLogin} it seems that you did not agree to the terms of service yet. Could you please check and update your issue, so I can proceed with your request.`
    });
    return false;
  }
  return true;
};

const isWaitingForApproval = (issue: Readonly<Issue>): boolean => {
  return hasLabel(issue, labels.waitingForApproval);
};

const isApproved = (issue: Readonly<Issue>): boolean => {
  return hasLabel(issue, labels.approved);
};

const getTeamMembers = async (team_slug: string) => {
  const unityAppApproversTeam = await listMembersInOrg({team_slug});
  return unityAppApproversTeam.map(user => user.login);
};

const requestApproval = async (issue: Issue, newAppIssue: NewAppIssue) => {
  if (isWaitingForApproval(issue) || isApproved(issue)) {
    return;
  }
  core.info(`requesting approval`);

  const userLogin = issue.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(issue.user, null, 2)} has no login.`);
  }
  const approvers = await getTeamMembers(teams.unityAppApproversSlug);

  if (approvers.includes(userLogin)) {
    // if requester is in the unityAppApproversTeam, we can skip the approval request process and approve directly
    await addLabelsToAnIssue({labels: [labels.approved]});
  } else {
    await addAssigneesToAnIssue({assignees: approvers});
    await addLabelsToAnIssue({labels: [labels.waitingForApproval]});
  }
};

const removeApprovalRequest = async (issue: Issue, newAppIssue: NewAppIssue) => {
  if (!isWaitingForApproval(issue)) {
    return;
  }
  core.info(`removing approval request`);
  let userLogin = issue.user?.login;
  commentOnIssue({
    body:
      `❓@${userLogin} the issue does not seem to be ready for approval anymore, so I am removing the approval request for now. As soon as the issue is ready, I will request approval again for you.`
  });
  await removeALabelFromAnIssue({name: labels.waitingForApproval});
  const assignees = await getTeamMembers(teams.unityAppApproversSlug);
  await removeAssigneesFromAnIssue({assignees});
};

const checkAppName = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  if (await isRepoExistent(newAppIssue.appSpec?.name)) {
    let userLogin = issue.user?.login;
    commentOnIssue({
      body:
        `🚫 @${userLogin} it seems that the name ${newAppIssue.appSpec?.name ?? ''} is already in use, please choose a different name.`
    });
    return false;
  }
  return true;
};

const isUserExistent = async (qNumber: string) => {
  try {
    await getAUser({username: qNumber});
    return true;
  } catch (e) {
    if (e instanceof RequestError && e.status === 404) {
      return false;
    }
    throw e;
  }
};

const checkAppMembers = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  const appSpec = newAppIssue.appSpec;
  if (appSpec && 'members' in appSpec) {
    for (let member of appSpec.members) {
      if (!await isUserExistent(member.qNumber)) {
        let userLogin = issue.user?.login;
        commentOnIssue({
          body:
            `🚫 @${userLogin} it seems that the user ${member.qNumber} cannot be found in GitHub. Please check the members in app specification.

            You can let me re-check by commenting \`${magicComments.check}\` on this issue.`
        });
        return false;
      }
    }
  }
  return true;
};

const areRunPreconditionsMet = (issue: Issue) => {
  if (isClosed(issue)) {
    core.info(`aborting, issue is closed`);
    return false;
  }
  if (!hasLabel(issue, labels.newApp)) {
    core.info(`aborting, issue is not labeled with ${labels.newApp}`);
    return false;
  }
  return true;
};

const run = async () => {
  core.debug(`cwd: ${process.cwd()}`);

  const issue = await getIssue();
  switch (github.context.eventName) {
  case 'issue_comment':
    const payloadComment = github.context.payload.comment as IssueComment;
    if (payloadComment.user?.login.startsWith('qq')) {
      // dont't react on qq-users comments
      return;
    }
    // TODO implement approval workflow based on LGTM
    if ((payloadComment.body ?? '').trim() !== magicComments.check && payloadComment.user) {
      return;
    }
    break;
  case 'issues':
    break;
  default:
    throw new Error(`unexpected eventName: ${github.context.eventName}`);
  }
  if (!areRunPreconditionsMet(issue)) {
    return;
  }
  const newAppIssue = parseIssueBody(issue.body ?? '');

  let allGood = true;

  allGood &&= await checkTermsOfService(issue, newAppIssue);
  allGood &&= await checkAppSchema(issue, newAppIssue);
  allGood &&= await checkAppName(issue, newAppIssue);
  allGood &&= await checkAppMembers(issue, newAppIssue);

  if (allGood) {
    await requestApproval(issue, newAppIssue);
  } else {
    await removeApprovalRequest(issue, newAppIssue);
  }
};

run().catch(e => {
  if (e instanceof Error) {
    core.error(`${e.message}\n${e.stack}`);
    core.setFailed(e.message);
  } else {
    core.setFailed(e);
  }
});
