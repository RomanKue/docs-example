import {Issue, Repository} from '../../../../github/api/issues/response/issue.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import issues from '../../../../github/api/issues/index.js';
import {lockAnIssue, setLabelsForAnIssue} from '../../../../github/api/issues/issues.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import {labels} from '../../../config.js';
import {getIssueState, issueState} from '../../issue-state.js';
import {freeze, produce} from 'immer';
import {partialMock} from '../../../../mock/partial-mock.js';
import * as repositories from '../../../../github/api/repos/repositories.js';
import * as deliverModule from './deliver.js';
import {closeWithComment, createNewApp, deliver} from './deliver.js';
import {SimpleUser} from '../../../../github/api/teams/response/simple-user.js';
import {issueType} from '../../issue-type.js';

const addLabel = (issue: Issue, ...labels: string[]) => {
  return produce(issue, draft => {
    labels.forEach(l => {
      draft.labels.push(partialMock<Label>({name: l}));
    });
  });
};

describe('deliver', () => {
  let issue: Issue;
  let user: SimpleUser;
  beforeEach(() => {
    issue = freeze(partialMock<Issue>({
      user: partialMock<SimpleUser>({login: 'creator'}),
      labels: [],
      body: `
I wish to run my app in UNITY. Here is the configuration I would like to start with:

\`\`\`yaml
apiVersion: v1beta1
name: my-app-name
\`\`\`

**Application Components**

 * [x] please generate a front-end [Angular](http://angular.io) stub from a template for me.
 * [x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.

**The Way We Work Together**

 * [x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html).
        `

    }));
    user = partialMock<SimpleUser>({login: 'user'});

    jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
    jest.spyOn(issues, 'lockAnIssue').mockResolvedValue();
    jest.spyOn(issues, 'updateAnIssue').mockResolvedValue(issue);
    jest.spyOn(issues, 'setLabelsForAnIssue').mockResolvedValue(partialMock<Label[]>());
  });
  describe('deliver', () => {
    it('should do nothing when issue is not labeled with new app label', async () => {
      await deliver(issue);
      expect(getIssueState(issue)).toBeNull();
    });
    it('should do nothing when issue is closed ', async () => {
      produce(issue, draft => {
        draft.closed_at = new Date().toISOString();
      });
      await deliver(issue);

      expect(getIssueState(issue)).toBeNull();
    });
    it('should do nothing when issue is in different state ', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      jest.spyOn(deliverModule, 'createNewApp').mockResolvedValue(partialMock<Repository>());

      await deliver(issue);

      expect(deliverModule.createNewApp).not.toHaveBeenCalled();
      expect(getIssueState(issue)).toEqual(issueState.waitingForReview);
    });
    it('should deliver when issue is approved', async () => {
      issue = addLabel(issue, labels.newApp, issueState.approved);

      jest.spyOn(deliverModule, 'createNewApp').mockResolvedValue(partialMock<Repository>());
      jest.spyOn(deliverModule, 'closeWithComment').mockResolvedValue();

      await deliver(issue);
      expect(deliverModule.createNewApp).toHaveBeenCalled();
      expect(deliverModule.closeWithComment).toHaveBeenCalled();
    });
  });
  describe('closeWithComment', () => {
    let repository: Repository;
    beforeEach(() => {
      repository = freeze(partialMock<Repository>({
        name: 'foo',
        html_url: 'https://foo',
      }));
    });
    it('should close with comment when called', async () => {
      const approvedIssue = {...issue, labels: [
        partialMock<Label>({name: issueType.newApp}),
        partialMock<Label>({name: issueState.approved})
      ]};
      await closeWithComment(approvedIssue, repository);
      expect(issues.commentOnIssue).toHaveBeenCalledWith(expect.objectContaining({
        body: expect.stringContaining(
          `Checkout your [foo](https://foo) repository.`
        )
      }));
      expect(issues.lockAnIssue).toHaveBeenCalledWith(expect.objectContaining({lock_reason: 'resolved'}));
      expect(issues.updateAnIssue).toHaveBeenCalledWith(expect.objectContaining({state: 'closed'}));
      expect(issues.setLabelsForAnIssue).toHaveBeenCalledWith(
        expect.objectContaining({labels: [issueType.newApp, issueState.delivered]})
      );
    });
  });
  describe('createNewApp', () => {
    it('should create new app when called', async () => {
      jest.spyOn(deliverModule, 'createNewApp').mockResolvedValue(partialMock<Repository>());
      await createNewApp(issue);
      expect(deliverModule.createNewApp).toHaveBeenCalled();
    });
  });
});
