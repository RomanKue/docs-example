/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';
import {NewAppIssue, parseIssueBody} from './new-issue.js';
import {
  addAssigneesToAnIssue,
  addLabelsToAnIssue,
  commentOnIssue,
  getIssue,
  removeALabelFromAnIssue,
  removeAssigneesFromAnIssue
} from '../lib/github/api/issues.js';
import {Issue} from '../lib/github/response/issue.js';
import {isKebabCase} from '../lib/case-conventions.js';
import {listMembersInOrg} from '../lib/github/api/teams.js';
import {labels, teams, workflows} from '../lib/unity/config.js';
import {createAWorkflowDispatchEvent} from '../lib/github/api/actions.js';
import * as yaml from 'js-yaml';

const checkAppSchema = (issue: Issue, newAppIssue: NewAppIssue): boolean => {
  core.info(`checking app yaml`);
  // later on, this should do a proper JSON schema match, for new we just check the name
  if (!isKebabCase(newAppIssue.appSpec?.name ?? '')) {
    let userLogin = issue.user?.login;
    commentOnIssue({
      body:
        `❌ @${userLogin} it seems that you have chosen an app name that does not meet our requirements. Could you pleas update your issue, choosing a different app name? Here are a few examples of app names that would work: \`fancy-calculator\`, \`magicmachine\``
    });
    return false;
  }
  return true;
};

const checkTermsOfService = (issue: Issue, newAppIssue: NewAppIssue): boolean => {
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

const isClosed = (issue: Readonly<Issue>): boolean => {
  return !!issue.closed_at;
};


const getTeamMembers = async (team_slug: string) => {
  const unityAppApproversTeam = await listMembersInOrg({team_slug});
  return unityAppApproversTeam.map(user => user.login);
};

const requestApproval = async (issue: Issue, newAppIssue: NewAppIssue) => {
  if (isWaitingForApproval(issue) || isApproved(issue)) {
    return;
  }

  const userLogin = issue.user?.login;
  if (!userLogin) {
    throw new Error(`user ${JSON.stringify(issue.user, null, 2)} has no login.`);
  }
  const approvers = await getTeamMembers(teams.unityAppApproversSlug);

  // if requester is in the unityAppApproversTeam, we can skip the review process
  if (approvers.indexOf(userLogin) >= 0) {
    await addLabelsToAnIssue({labels: []});
  } else {
    await addAssigneesToAnIssue({assignees: approvers});
    await addLabelsToAnIssue({labels: [labels.waitingForApproval]});
  }
};

const removeReviewRequest = async (issue: Issue, newAppIssue: NewAppIssue) => {
  let userLogin = issue.user?.login;
  commentOnIssue({
    body:
      `❓@${userLogin} the issue does not seem to ve ready for approval anymore, so I am removing the approval request for now. As soon as the issue is ready, I will request approval again for you.`
  });
  await removeALabelFromAnIssue({name: labels.waitingForApproval});

  const assignees = await getTeamMembers(teams.unityAppApproversSlug);
  await removeAssigneesFromAnIssue({assignees});
};

const dispatchNewAppWorkflow = async (issue: Issue, newAppIssue: NewAppIssue) => {
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

const run = async () => {
  const issue = await getIssue();
  if (isClosed(issue)) {
    return;
  }
  const newAppIssue = parseIssueBody(issue.body ?? '');

  let allConditionsChecked = true;

  allConditionsChecked &&= checkTermsOfService(issue, newAppIssue);
  allConditionsChecked &&= checkAppSchema(issue, newAppIssue);

  if (allConditionsChecked) {
    if (isApproved(issue)) {
      await deliver(issue, newAppIssue);
    } else {
      await requestApproval(issue, newAppIssue);
    }
  } else {
    await removeReviewRequest(issue, newAppIssue);
  }
};

run().catch(e => {
  if (e instanceof Error) {
    core.setFailed(e.message);
  } else {
    core.setFailed(e);
  }
});
