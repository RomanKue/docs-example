import {handleWorkflowEvent, run} from '../lib/run.js';
import {handleIssueChange, handleMagicComments} from '../lib/unity/issues/decommission-app/event-handler.js';

run(async () => {
  await handleWorkflowEvent({
    issues: handleIssueChange,
    issue_comment: handleMagicComments,
  });
});
