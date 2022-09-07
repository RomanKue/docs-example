/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import {Issue} from '../lib/github/api/issues/response/issue.js';
import {AppSpec, parseYaml} from '../lib/unity/app-spec.js';
import {commentOnIssue, getIssue, lockAnIssue, updateAnIssue} from '../lib/github/api/issues/issues.js';
import {parseIssueBody} from '../lib/unity/issues/new-app/new-app-issue.js';
import {Repository} from '../lib/github/api/repos/response/repository.js';
import {createRepository} from '../lib/unity/app-repo/index.js';
import {run} from '../lib/run.js';
import {getIssueState, isNewAppIssue, issueState} from '../lib/unity/issues/new-app/index.js';

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
  const appRepository = await createRepository(appSpec);

  // deploy Helm chart
  // TODO setup workflows in the repo for create-angular-stub, create-quarkus-stub
  // TODO trigger them via workflow dispatch
  // TODO patch app.yaml from workflows
  // TODO create service account and setup token in secret
  // TODO setup workflow to install helm chart

  return appRepository;
};

const closeWithComment = (issue: Issue, appRepository: Repository) => {
  let userLogin = issue.user?.login;
  commentOnIssue({
    body:
      `🚀 @${userLogin} your app has been created!\n\nCheckout your [${appRepository.name}](${appRepository.html_url}) repository.`
  });
  updateAnIssue({
    state: 'closed',
  });
  lockAnIssue({
    lock_reason: 'resolved'
  });
};

const areRunPreconditionsMet = (issue: Issue) => {
  return isNewAppIssue(issue) && getIssueState(issue) === issueState.approved;
};

// TODO refactor this
run(async () => {
  let issue: Issue | undefined;
  let appSpec: AppSpec | undefined;
  switch (github.context.eventName) {
  case 'issues':
    issue = await getIssue();
    if (!areRunPreconditionsMet(issue)) {
      return;
    }
    appSpec = triggeredByIssue(issue);
    break;
  default:
    throw new Error(`unexpected eventName: ${github.context.eventName}`);
  }

  if (!appSpec) {
    throw new Error('missing appSpec');
  }

  const appRepository = await createNewApp(appSpec);
  if (issue) {
    await closeWithComment(issue, appRepository);
  }
});
