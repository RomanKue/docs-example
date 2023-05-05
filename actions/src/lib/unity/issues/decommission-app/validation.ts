import {AppSpec, repoName} from '../../app-spec.js';
import {repositoriesUtils} from '../../../github/api/repos/index.js';
import {issuesUtils} from '../../../github/api/issues/index.js';
import {getAllRepositoryTopics, getRepositoryPermissionForAUser} from '../../../github/api/repos/repositories.js';
import {adminPermission, defaultTopics, unityAppAdminRole} from '../../config.js';
import {getIssueUserLogin} from '../../../github/api/issues/issues-utils.js';
import {updateAnIssue} from '../../../github/api/issues/issues.js';
import {DecommissionAppIssue} from './decommission-app-issue.js';
import {Issue} from '../../../github/api/issues/response/issue.js';
import {ReadonlyDeep} from 'type-fest';

export const validateDecommissionAppIssue = async (decommissionApp: DecommissionAppIssue, githubIssue: Issue): Promise<boolean> => {
  const appSpec = decommissionApp.appSpec;
  if (!appSpec) {
    throw new Error(`could not parse appSpec from issue: ${JSON.stringify(githubIssue, null, 2)}`);
  }
  const repositoryName = repoName(appSpec.name);

  const isRepositoryValid = await validateRepositoryExists(appSpec, githubIssue);
  if (!isRepositoryValid) {
    return isRepositoryValid;
  }

  const hasUnityAppTopic = await validateHasUnityAppTopic(repositoryName, githubIssue);
  if (!hasUnityAppTopic) {
    return hasUnityAppTopic;
  }

  const issueUserHasPermission = await validateIssueUserHasPermission(repositoryName, githubIssue);
  if (!issueUserHasPermission) {
    return issueUserHasPermission;
  }

  return true;
};

const validateRepositoryExists = async (appSpec: ReadonlyDeep<AppSpec>, githubIssue: Issue): Promise<boolean> => {
  const repositoryName = repoName(appSpec.name);
  const isRepoExistent = await repositoriesUtils.isRepoExistent(appSpec.name);
  if (!isRepoExistent) {
    await issuesUtils.addSimpleComment(githubIssue, user =>
      `@${user} I could not find the repository "${repositoryName}", please update your issue with the correct repository name. `
    );
    return false;
  }

  return true;
};

const validateHasUnityAppTopic = async (repositoryName: string, githubIssue: Issue): Promise<boolean> => {
  const topic = await getAllRepositoryTopics(repositoryName);
  if (!topic.names.includes(defaultTopics.unityApp)) {
    await issuesUtils.addSimpleComment(githubIssue, user =>
      `@${user} I could not find the topic ${defaultTopics.unityApp} on the the repository "${repositoryName}", please update your issue with the correct topic.`
    );
    return false;
  }

  return true;
};

const validateIssueUserHasPermission = async (repositoryName: string, githubIssue: Issue): Promise<boolean> => {
  const issueUser = getIssueUserLogin(githubIssue);
  const repositoryPermission = await getRepositoryPermissionForAUser({
    username: issueUser,
    repositoryName: repositoryName
  });
  if (repositoryPermission.role_name !== unityAppAdminRole && repositoryPermission.permission !== adminPermission) {
    await issuesUtils.addSimpleComment(githubIssue, user =>
      `@${user} unfortunately, I cannot fulfil your request, since you don't have permission to decommission this app.
      Please make sure you have the "${unityAppAdminRole}" role or "${adminPermission}" permission on the repository "${repositoryName}".`
    );
    await updateAnIssue({
      state: 'closed',
    });
    return false;
  }

  return true;
};
