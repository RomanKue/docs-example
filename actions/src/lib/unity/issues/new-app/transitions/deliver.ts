import {Issue} from '../../../../github/api/issues/response/issue.js';
import * as yaml from 'js-yaml';
import {getIssueState, issueState, setIssueState} from '../state.js';
import * as core from '@actions/core';
import {parseIssueBody} from '../new-app-issue.js';
import {lockAnIssue, updateAnIssue} from '../../../../github/api/issues/issues.js';
import {appYamlPath, createRepository} from '../../../app-repo/index.js';
import {Repository} from '../../../../github/api/repos/response/repository.js';
import {addSimpleComment} from '../../../../github/api/issues/issues-utils.js';
import {createAWorkflowDispatchEvent} from '../../../../github/api/actions/actions.js';
import {AppSpec, isV1Beta1, repoName} from '../../../app-spec.js';
import {repositoriesUtils} from '../../../../github/api/repos/index.js';
import {produce} from 'immer';
import {makeStubWorkflowFileName} from '../../../app-repo/workflows/make-stub-workflow.js';

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

const updateAppDeployments = async (appSpec: AppSpec, name: string, replicas = 2) => {
  if (isV1Beta1(appSpec)) {
    appSpec = produce(appSpec, draft => {
      const deployments = draft.deployments ?? {};
      deployments[name] = {replicas};
      draft.deployments = deployments;
    });
    await repositoriesUtils.updateFile(repoName(appSpec.name), appYamlPath, yaml.dump(appSpec));
  }
  return appSpec;
};


export const createNewApp = async (issue: Issue): Promise<Repository> => {
  const newAppIssue = parseIssueBody(issue.body ?? '');
  let appSpec = newAppIssue.appSpec;
  if (!appSpec) {
    throw new Error(`could not parse appSpec from issue: ${JSON.stringify(issue, null, 2)}`);
  }

  const appRepository = await createRepository(appSpec);

  if (newAppIssue.generateAngularStub) {
    const name = 'ui';
    await createAWorkflowDispatchEvent({
      repo: appRepository.name,
      ref: 'main',
      workflow_id: makeStubWorkflowFileName,
      inputs: {
        name: name,
        type: 'angular',
        branch: 'main',
        ref: 'main',
      }
    });
    appSpec = await updateAppDeployments(appSpec, name);
  }

  if (newAppIssue.generateQuarkusStub) {
    const name = 'business';
    await createAWorkflowDispatchEvent({
      repo: appRepository.name,
      ref: 'main',
      workflow_id: makeStubWorkflowFileName,
      inputs: {
        name: name,
        type: 'quarkus',
        branch: 'main',
        ref: 'main',
      }
    });
    appSpec = await updateAppDeployments(appSpec, name);
  }

  return appRepository;
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

