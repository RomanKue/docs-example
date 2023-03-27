import {getInput, RecreateAppWorkflowsInputs} from '../../lib/github/input.js';
import {listOrganizationRepositories} from '../../lib/github/api/repos/repositories.js';
import {recreateRepoAppWorkflows} from '../../lib/unity/app-repo/index.js';

/**
 * Recreate the workflows for the apps matching the `repository-regex`.
 */
export const recreateAppWorkflows = async () => {
  const appRegex = getInput<RecreateAppWorkflowsInputs>('repository-regex');
  const branch = getInput<RecreateAppWorkflowsInputs>('branch');
  const title = getInput<RecreateAppWorkflowsInputs>('title');
  const body = getInput<RecreateAppWorkflowsInputs>('body');
  const repositories = (await listOrganizationRepositories()).filter(repo => repo.name.match(appRegex));
  if (repositories) {
    for (const repo of repositories) {
      if (!repo.archived) {
        await recreateRepoAppWorkflows({repo: repo.name, branch, title, body});
      }
    }
  }
};
