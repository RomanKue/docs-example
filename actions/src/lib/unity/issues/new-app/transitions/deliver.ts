import {Issue} from '../../../../github/api/issues/response/issue.js';
import {getIssueState, issueState, setIssueState} from '../state.js';
import * as core from '@actions/core';
import {parseIssueBody} from '../new-app-issue.js';
import {lockAnIssue, updateAnIssue} from '../../../../github/api/issues/issues.js';
import {createRepository} from '../../../app-repo/index.js';
import {Repository} from '../../../../github/api/repos/response/repository.js';
import {addSimpleComment} from '../../../../github/api/issues/issues-utils.js';
import {ReadonlyDeep} from 'type-fest';
import {unityTeams} from '../../../config.js';

export const closeWithComment = async (issue: Issue, appRepository: ReadonlyDeep<Repository>) => {
  await addSimpleComment(issue, user =>
    `🚀 @${user} your app has been created!\n\nCheckout your [${appRepository.name}](${appRepository.html_url}) repository.`
  );
  await setIssueState(issue, issueState.delivered);
  await updateAnIssue({
    state: 'closed',
  });
  await lockAnIssue({
    lock_reason: 'resolved'
  });
};

export const createNewApp = async (issue: Issue): Promise<ReadonlyDeep<Repository>> => {
  const newAppIssue = parseIssueBody(issue.body ?? '');
  let appSpec = newAppIssue.appSpec;
  if (!appSpec) {
    throw new Error(`could not parse appSpec from issue: ${JSON.stringify(issue, null, 2)}`);
  }

  try {
    const {appSpec: updatedAppSpec, appRepository} = await createRepository(issue, newAppIssue, appSpec);

    // if we ever continue to do something with appSpec, we need to continue with the updated one
    appSpec = updatedAppSpec;

    return appRepository;
  } catch (e) {
    await addSimpleComment(issue, user =>
      `❗️ @${user} something unexpected happened. I suggest you get in touch with the @${unityTeams.unityAppApproversSlug}, so they can take a look at the issue.`
    );
    throw e;
  }
};


export const deliver = async (
  issue: Issue,
): Promise<void> => {
  if (getIssueState(issue) !== issueState.approved) {
    return;
  }
  core.info(`deliver app for issue: ${issue.html_url}`);
  const appRepository = await createNewApp(issue);
  await closeWithComment(issue, appRepository);
};

