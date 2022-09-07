import {Issue} from '../../../../github/api/issues/response/issue.js';
import {getIssueState, issueState, setIssueState} from '../state.js';
import * as core from '@actions/core';
import {parseIssueBody} from '../new-app-issue.js';
import {lockAnIssue, updateAnIssue} from '../../../../github/api/issues/issues.js';
import {createRepository} from '../../../app-repo/index.js';
import {AppSpec} from '../../../app-spec.js';
import {Repository} from '../../../../github/api/repos/response/repository.js';
import {addSimpleComment} from '../../../../github/api/issues/issues-utils.js';

export const closeWithComment = async (issue: Issue, appRepository: Repository) => {
  const userLogin = issue.user?.login;
  await addSimpleComment(issue, user =>
    `🚀 @${userLogin} your app has been created!\n\nCheckout your [${appRepository.name}](${appRepository.html_url}) repository.`
  );
  await setIssueState(issue, issueState.delivered);
  await updateAnIssue({
    state: 'closed',
  });
  await lockAnIssue({
    lock_reason: 'resolved'
  });
};

export const createNewApp = async (appSpec: AppSpec): Promise<Repository> => {
  const appRepository = await createRepository(appSpec);

  // deploy Helm chart
  // TODO setup workflows in the repo for create-angular-stub, create-quarkus-stub
  // TODO trigger them via workflow dispatch
  // TODO patch app.yaml from workflows
  // TODO create service account and setup token in secret
  // TODO setup workflow to install helm chart

  return appRepository;
};


export const deliver = async (
  issue: Issue,
): Promise<void> => {
  if (getIssueState(issue) !== issueState.approved) {
    return;
  }
  core.info(`deliver app for issue: ${issue.html_url}`);
  const newAppIssue = parseIssueBody(issue.body ?? '');
  if (!newAppIssue.appSpec) {
    throw new Error(`could not parse appSpec from issue: ${JSON.stringify(issue, null, 2)}`);
  }
  const appRepository = await createNewApp(newAppIssue.appSpec);
  await closeWithComment(issue, appRepository);
};

