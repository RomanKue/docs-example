import * as core from '@actions/core';
import * as github from '@actions/github';
import {IssueComment} from './github/api/issues/response/issue-comment.js';
import {getIssue} from './github/api/issues/issues.js';
import {Issue} from './github/api/issues/response/issue.js';
import {GeneralInputs, getInput} from './github/input.js';

/**
 * wrapper for main functions with error handling and global debug logging
 */
export const run = (callback: () => Promise<void>) => {
  setWorkingDirectory();

  core.info(`cwd: ${process.cwd()}`);
  core.debug(`context: ${JSON.stringify(github.context, null, 2)}`);
  callback().catch(e => {
    if (e instanceof Error) {
      core.warning(`${e.message}\n${e.stack}`);
      core.setFailed(e.message);
    } else {
      core.setFailed(e as string | Error);
    }
  });
};


export interface EventHandlers {
  /**
   * see https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#issue_comment
   */
  issue_comment?: (issue: Issue, comment: IssueComment) => Promise<void>;
  /**
   * see https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#issues
   */
  issues?: (issue: Issue) => Promise<void>;
  /**
   * see https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#label
   */
  label?: (issue: Issue) => Promise<void>;
}

export const assertUnreachable = (x: never): never => {
  throw new Error(`Didn't expect to get here, got value: ${x}`);
};

export const handleWorkflowEvent = async (eventHandler: EventHandlers) => {
  const eventName = github.context.eventName;
  core.info(`handling workflow event: ${eventName}`);
  switch (eventName) {
  case 'issue_comment': {
    const issue = await getIssue();
    const comment = github.context.payload.comment as IssueComment;
    eventHandler[eventName]?.(issue, comment);
    break;
  }
  case 'issues': {
    const issue = await getIssue();
    eventHandler[eventName]?.(issue);
    break;
  }
  case 'label': {
    const issue = await getIssue();
    eventHandler[eventName]?.(issue);
    break;
  }
  default:
    throw new Error(`unexpected eventName: ${eventName}`);
  }
};

const setWorkingDirectory = () => {
  let workingDirectory;
  try {
    workingDirectory = getInput<GeneralInputs>('working-directory');
  } catch (e) {
    core.debug('Working directory is not set');
  }
  if (workingDirectory) {
    core.debug(`changing to: ${workingDirectory}`);
    process.chdir(workingDirectory);
  }
};
