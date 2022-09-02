/**
 *
 * @see https://github.com/actions/typescript-action
 * @see https://github.com/octokit/octokit.js
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as yaml from 'js-yaml';
import {Issue} from '../../lib/github/api/issues/response/issue.js';
import {AppSpec, isRepoExistent, isV1Beta1, parseYaml, repoName} from '../../lib/unity/app-spec.js';
import {commentOnIssue, getIssue, lockAnIssue, updateAnIssue} from '../../lib/github/api/issues/issues.js';
import {hasLabel, isClosed, parseIssueBody} from '../../lib/unity/custom-issues/new-app-issue.js';
import {
  addARepositoryCollaborator,
  createAnOrganizationRepository,
  createOrUpdateFileContents
} from '../../lib/github/api/repos/repositories.js';
import {defaultBranches, labels} from '../../lib/unity/config.js';
import {Repository} from '../../lib/github/api/repos/response/repository.js';
import {createAReference} from '../../lib/github/api/git/git.js';
import {FileCommit} from '../../lib/github/api/repos/response/file-commit.js';

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


function createReadme(appSpec: AppSpec) {
  return `
# ${appSpec.name}
`.trim();
}

const createNewApp = async (appSpec: AppSpec) => {
  const newAppRepoName = repoName(appSpec.name);
  if (await isRepoExistent(appSpec.name)) {
    throw new Error(`the repository ${newAppRepoName} already exists`);
  }

  const appRepository = await createAnOrganizationRepository({
    name: newAppRepoName,
    visibility: 'internal'
  });

  let commit: FileCommit;
  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: 'app.yaml',
    content: yaml.dump(appSpec),
    message: `add app.yaml`
  });

  commit = await createOrUpdateFileContents({
    repo: appRepository.name,
    path: 'README.md',
    content: createReadme(appSpec),
    message: `add app.yaml`
  });

  for (let defaultBranch in Object.values(defaultBranches)) {
    await createAReference({
      repo: appRepository.name,
      ref: `refs/heads/${defaultBranch}`,
      sha: commit.commit.sha!
    });
  }

  if ('members' in appSpec) {
    for (const member of appSpec.members) {
      await addARepositoryCollaborator({
        repo: appRepository.name,
        username: member.qNumber,
      });
    }
  }


  return appRepository;
};

const closeWithComment = (issue: Issue, appRepository: Repository) => {
  let userLogin = issue.user?.login;
  commentOnIssue({
    body:
      `🚀 @${userLogin} your app has been created!
      Checkout your [${appRepository.name}](${appRepository.url}) repository.`
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
  if (!hasLabel(issue, labels.newApp)) {
    core.info(`aborting, issue is not labeled with ${labels.newApp}`);
    return false;
  }
  if (!hasLabel(issue, labels.approved)) {
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

  const appRepository = await createNewApp(appSpec);
  if (issue) {
    await closeWithComment(issue, appRepository);
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
