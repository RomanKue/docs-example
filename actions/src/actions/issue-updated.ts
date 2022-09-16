import {handleWorkflowEvent, run} from '../lib/run.js';
import {handleIssueChange, handleMagicComments} from '../lib/unity/issues/index.js';

run(async () => {
  await handleWorkflowEvent({
    issues: handleIssueChange,
    issue_comment: handleMagicComments,
  });
});
