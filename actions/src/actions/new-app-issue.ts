import {handleWorkflowEvent, run} from '../lib/run.js';
import {handleIssueChange, handleMagicComments} from '../lib/unity/issues/new-app/event-handler.js';


run(async () => {
  await handleWorkflowEvent({
    issues: handleIssueChange,
    issue_comment: handleMagicComments,
  });
});
