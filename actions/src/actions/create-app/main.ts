/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import {Issue} from '../../lib/github/api/issues/response/issue.js';
import {AppSpec, isRepoExistent, parseYaml, repoName} from '../../lib/unity/app-spec.js';
import {commentOnIssue, getIssue, lockAnIssue, updateAnIssue} from '../../lib/github/api/issues/issues.js';
import {isClosed, parseIssueBody} from '../../lib/unity/custom-issues/new-app-issue.js';
import {createAnOrganizationRepository, listOrganizationRepositories} from '../../lib/github/api/repos/repositories.js';
import {labels, repos} from '../../lib/unity/config.js';

const triggeredByWorkflowDispatch = (): AppSpec => {
  const appYaml = core.getInput('appYaml');
  const appSpec = parseYaml(appYaml);
  return appSpec;
};

const triggeredByIssue = (issue: Issue): AppSpec => {
  const newAppIssue = parseIssueBody(issue.body ?? '');
  if (!newAppIssue.appSpec) {
    throw new Error(`could not parse appSpec from issue: ${JSON.stringify(issue, null, 2)}`);
  }
  return newAppIssue.appSpec;
};


const createNewApp = async (appSpec: AppSpec) => {
  const newAppRepoName = repoName(appSpec.name);
  if (await isRepoExistent(appSpec.name)) {
    throw new Error(`the repository ${newAppRepoName} already exists`);
  }

  const appRepository = await createAnOrganizationRepository({
    name: newAppRepoName,
  });
};

const closeWithComment = (issue: Issue) => {
  let userLogin = issue.user?.login;
  commentOnIssue({
    body:
      `🚀 @${userLogin} your app has been created!`
  });
  updateAnIssue({
    state: 'closed',
  });
  lockAnIssue({
    lock_reason: 'resolved'
  });
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
  let issue: Issue | undefined;
  let appSpec: AppSpec | undefined;
  switch (github.context.eventName) {
  case 'workflow_dispatch':
    appSpec = triggeredByWorkflowDispatch();
    break;
  case 'issues':
    issue = await getIssue();
    if (!areRunPreconditionsMet(issue)) {
      return;
    }
    appSpec = triggeredByIssue(issue);
    break;
  default:
    throw new Error(`unexpected eventName
: ${github.context.eventName}
  `);
  }

  if (!appSpec) {
    throw new Error('missing appSpec');
  }

  createNewApp(appSpec);
  if (issue) {
    closeWithComment(issue);
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
