import {handleWorkflowEvent} from '../../lib/run.js';
import {handleIssueChange, handleMagicComments} from '../../lib/unity/issues/index.js';

/**
 * Handles an issue change.
 */
export const issueUpdated = async () => {
  await handleWorkflowEvent({
    issues: handleIssueChange,
    issue_comment: handleMagicComments,
  });
};
