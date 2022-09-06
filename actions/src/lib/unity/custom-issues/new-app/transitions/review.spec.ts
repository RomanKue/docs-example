import {reviewIssue} from './review.js';
import {Issue, SimpleUser} from '../../../../github/api/issues/response/issue.js';
import {freeze, produce} from 'immer';
import {partialMock} from '../../../../mock/partial-mock.js';
import {labels} from '../../../config.js';
import {issueState} from '../state.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import * as requestApproval from './request-approval.js';
import * as removeApprovalRequest from './remove-approval-request.js';
import * as repositories from '../../../../github/api/repos/repositories.js';
import * as users from '../../../../github/api/users/users.js';
import * as issues from '../../../../github/api/issues/issues.js';
import {PrivateUser, PublicUser} from '../../../../github/api/users/response/user.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';

const addLabel = (issue: Issue, ...labels: string[]) => {
  return produce(issue, draft => {
    labels.forEach(l => {
      draft.labels.push(partialMock<Label>({name: l}));
    });
  });
};

describe('review', () => {
  let issue: Issue;
  let user: SimpleUser;
  beforeEach(() => {
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = freeze(partialMock<Issue>({
      user: user,
      labels: [],
    }));
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('reviewIssue', () => {
    it('should request approval when issue is all good', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      issue = produce(issue, draft => {
        draft.body = `
I wish to run my app in UNITY. Here is the configuration I would like to start with:

\`\`\`yaml
apiVersion: v1beta1
name: my-app-name
members: # dev ops team members that have access to the app
  - qNumber: q123456
\`\`\`

**Application Components**

 * [x] please generate a front-end [Angular](http://angular.io) stub from a template for me.
 * [x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.

**The Way We Work Together**

 * [x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html).
        `;
      });
      jest.spyOn(requestApproval, 'requestApproval').mockResolvedValue();
      jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
      jest.spyOn(users, 'getAUser').mockResolvedValue(partialMock<PrivateUser | PublicUser>({login: user.login}));
      await reviewIssue(issue);
      expect(users.getAUser).toHaveBeenCalled();
      expect(repositories.listOrganizationRepositories).toHaveBeenCalled();
      expect(requestApproval.requestApproval).toHaveBeenCalled();
    });
    it('should remove request for approval when issue is fails checks', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      issue = produce(issue, draft => {
        draft.body = `
I wish to run my app in UNITY. Here is the configuration I would like to start with:

\`\`\`yaml
apiVersion: v1beta1
name: my-app-name
members: # dev ops team members that have access to the app
  - qNumber: q123456
\`\`\`

**Application Components**

 * [x] please generate a front-end [Angular](http://angular.io) stub from a template for me.
 * [x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.

**The Way We Work Together**

 * [ ] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html).
        `;
      });
      jest.spyOn(removeApprovalRequest, 'removeApprovalRequest').mockResolvedValue();
      jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>({}));
      jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
      jest.spyOn(users, 'getAUser').mockResolvedValue(partialMock<PrivateUser | PublicUser>({login: user.login}));
      await reviewIssue(issue);
      expect(removeApprovalRequest.removeApprovalRequest).toHaveBeenCalled();
    });
  });
});
