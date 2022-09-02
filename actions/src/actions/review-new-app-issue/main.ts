/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';
import {isClosed, NewAppIssue, parseIssueBody} from '../../lib/unity/custom-issues/new-app-issue.js';
import {
  addAssigneesToAnIssue,
  addLabelsToAnIssue,
  commentOnIssue,
  getIssue,
  removeALabelFromAnIssue,
  removeAssigneesFromAnIssue
} from '../../lib/github/api/issues/issues.js';
import {Issue} from '../../lib/github/api/issues/response/issue.js';
import {isKebabCase} from '../../lib/case-conventions.js';
import {listMembersInOrg} from '../../lib/github/api/teams/teams.js';
import {labels, teams, workflows} from '../../lib/unity/config.js';
import {createAWorkflowDispatchEvent} from '../../lib/github/api/actions/actions.js';
import * as yaml from 'js-yaml';
import {listOrganizationRepositories} from '../../lib/github/api/repos/repositories.js';
import {isRepoExistent, repoName} from '../../lib/unity/app-spec.js';

const checkAppSchema = async (issue: Issue, newAppIssue: NewAppIssue): Promise<boolean> => {
  core.info(`checking app yaml`);
  // later on, this should do a proper JSON schema match, for new we just check the name
  if (!isKebabCase(newAppIssue.appSpec?.name ?? '')) {
    let userLogin = issue.user?.login;
    commentOnIssue({
      body:
        `❌ @${userLogin} it seems that you have chosen an app name that does not meet our requirements. Could you please update your issue, choosing a different app name? Here are a few examples of app names that would work: \`fancy-calculator\`, \`magicmachine\``
    });
    return false;
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
  return issue.labels.indexOf(labels.waitingForApproval) >= 0;
};

const isApproved = (issue: Readonly<Issue>): boolean => {
  return issue.labels.indexOf(labels.approved) >= 0;
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

  if (approvers.indexOf(userLogin) >= 0) {
    // if requester is in the unityAppApproversTeam, we can skip the approval request process and approve directly
    await addLabelsToAnIssue({labels: [labels.approved]});
    await deliver(issue, newAppIssue);
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

const dispatchNewAppWorkflow = async (issue: Issue, newAppIssue: NewAppIssue) => {
  core.info(`dispatching ${workflows.createApp} workflow`);
  await createAWorkflowDispatchEvent({
    workflow_id: workflows.createApp,
    ref: 'main', inputs: {
      appYaml: yaml.dump(newAppIssue.appSpec)
    }
  });
};

const deliver = async (issue: Issue, newAppIssue: NewAppIssue) => {
  await dispatchNewAppWorkflow(issue, newAppIssue);
  let userLogin = issue.user?.login;
  commentOnIssue({
    body:
      `📦 @${userLogin} good news, I started setting up your app. I'll let you know when the your app is delivered.`
  });
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

const areRunPreconditionsMet = (issue: Issue) => {
  if (isClosed(issue)) {
    core.info(`aborting, issue is closed`);
    return false;
  }
  if (!issue.labels.includes(labels.newApp)) {
    core.info(`aborting, issue is not labeled with ${labels.newApp}`);
    return false;
  }
  if (!issue.labels.includes(labels.approved)) {
    core.info(`aborting, issue is not labeled with ${labels.approved}`);
    return false;
  }
  return true;
};

const run = async () => {
  const issue = await getIssue();
  if (!areRunPreconditionsMet(issue)) {
    return;
  }
  const newAppIssue = parseIssueBody(issue.body ?? '');

  let allGood = true;

  allGood &&= await checkTermsOfService(issue, newAppIssue);
  allGood &&= await checkAppSchema(issue, newAppIssue);
  allGood &&= await checkAppName(issue, newAppIssue);

  if (allGood) {
    if (isApproved(issue)) {
      await deliver(issue, newAppIssue);
    } else {
      await requestApproval(issue, newAppIssue);
    }
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
