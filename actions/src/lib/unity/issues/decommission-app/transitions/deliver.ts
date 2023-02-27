import { Issue } from '../../../../github/api/issues/response/issue.js';
import { getIssueState, issueState, setIssueState } from '../../issue-state.js';
import * as core from '@actions/core';
import { issuesUtils } from '../../../../github/api/issues/index.js';
import { DecommissionAppIssue } from '../decommission-app-issue.js';
import { AppSpec, repoName } from '../../../app-spec.js';
import { getARepository, updateARepository } from '../../../../github/api/repos/repositories.js';
import { environments, githubSecretKeys, unityTeams } from '../../../config.js';
import { lockAnIssue, updateAnIssue } from '../../../../github/api/issues/issues.js';
import { deleteK8sObjects } from '../../../app-repo/k8s.js';
import { deleteAnEnvironmentSecret } from '../../../../github/api/actions/actions.js';
import { getIssueType, issueType } from '../../issue-type.js';

export const deliver = async (
  issue: Issue,
  decommissionAppIssue: DecommissionAppIssue
): Promise<void> => {
  if (getIssueState(issue) !== issueState.waitingForReview || getIssueType(issue) !== issueType.decommissionApp) {
    return;
  }

  core.info(`deliver app for issue: ${issue.html_url}`);
  const appSpec = decommissionAppIssue.appSpec as AppSpec;

  const repositoryName = repoName(appSpec.name);

  let appRepository = await getARepository({repo: repositoryName});
  await issuesUtils.addSimpleComment(issue, user =>
    `🏗 @${user} be patient while I decommission your [${appRepository.name}](${appRepository.html_url}).`
  );

  appRepository = await updateARepository(repositoryName, {
    archived: true
  });

  for (const env of Object.values(environments)) {

    await deleteK8sObjects(env, repositoryName);

    await deleteAnEnvironmentSecret({
      secret_name: githubSecretKeys.kubernetesToken,
      environment_name: env,
      repository_id: appRepository.id
    });
  }

  await issuesUtils.addSimpleComment(issue, user =>
    `🏗 @${user} your [${appRepository.name}](${appRepository.html_url}) is now archived and all deployments have been removed,
    if you need to restore your app in the future, please contact @${unityTeams.unityAppApproversSlug}.`
  );
  await setIssueState(issue, issueState.delivered);
  await updateAnIssue({
    state: 'closed',
  });
  await lockAnIssue({
    lock_reason: 'resolved'
  });
};

