import * as review from './review.js';
import {checkAppName, checkAppSchema, checkTermsOfService, reviewIssue} from './review.js';
import * as yaml from 'js-yaml';
import {Issue} from '../../../../github/api/issues/response/issue.js';
import {freeze, produce} from 'immer';
import {partialMock} from '../../../../mock/partial-mock.js';
import {labels} from '../../../config.js';
import {issueState} from '../../issue-state.js';
import {Label} from '../../../../github/api/issues/response/label.js';
import * as requestApproval from './request-approval.js';
import * as removeApprovalRequest from './remove-approval-request.js';
import * as repositories from '../../../../github/api/repos/repositories.js';
import * as users from '../../../../github/api/users/users.js';
import issues from '../../../../github/api/issues/index.js';
import {PrivateUser, PublicUser} from '../../../../github/api/users/response/user.js';
import {IssueComment} from '../../../../github/api/issues/response/issue-comment.js';
import {NewAppIssue} from '../new-app-issue.js';
import {AppSpec, AppSpecV1Beta1, repoName} from '../../../app-spec.js';
import {MinimalRepository} from '../../../../github/api/repos/response/minimal-repository.js';
import {SimpleUser} from '../../../../github/api/teams/response/simple-user.js';
import {ContentFile} from '../../../../github/api/repos/response/content.js';
import {base64} from '../../../../strings/encoding.js';

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
  let schema: Record<string, unknown>;
  beforeEach(() => {
    schema = {
      '$schema': 'http://json-schema.org/draft-07/schema',
      'definitions': {
        'containerV1': {
          'description': 'specs for the container to deploy',
          'type': 'object',
          'properties': {
            'image': {
              'description': 'name of the image inside the unity org registry',
              'type': 'string',
              'pattern': 'app-[a-zA-Z0-9_.-]+',
              'minLength': 1,
              'maxLength': 32
            },
            'tag': {
              'type': 'string',
              'description': 'tag of the image to deploy',
              'pattern': '[a-z09_.-]+',
              'minLength': 1,
              'maxLength': 128
            },
          },
          'required': [
            'image',
            'tag'
          ]
        },
        'deploymentsV1': {
          'description': 'name of the deployment in camel case',
          'propertyNames': {
            'minLength': 2,
            'maxLength': 12
          },
          'patternProperties': {
            '^[a-z0-9]+(?:-[a-z0-9]+)*$': {
              '$ref': '#/definitions/DeploymentV1'
            }
          },
          'additionalProperties': false,
          'type': 'object'
        },
        'nameV1': {
          'type': 'string',
          'description': 'name of the app in kebab case',
          'pattern': '^[a-z0-9]+(?:-[a-z0-9]+)*$',
          'maxLength': 32,
          'minLength': 3
        },
        'environmentV1': {
          'type': 'string',
          'description': 'environment:test, int, prod',
        },
        'appCatalogV1': {
          'additionalProperties': 'false',
          'properties': {
            'showAs': {
              'type': ['null', 'string'],
              'enum': ['API', 'App', 'Hidden']
            }
          }
        },
        'v1beta1': {
          'properties': {
            'apiVersion': {
              'description': 'api version of the app schema',
              'const': 'v1beta1'
            },
            'deployments': {
              '$ref': '#/definitions/deploymentsV1'
            },
            'name': {
              '$ref': '#/definitions/nameV1'
            },
            'environment': '#/definitions/environmentV1',
            'appCatalog': '#/definitions/appCatalogV1',
          },
          'additionalProperties': false,
          'required': [
            'apiVersion',
            'name',
            'environment'
          ]
        },
        'v1': {
          'properties': {
            'apiVersion': {
              'description': 'api version of the app schema',
              'const': 'v1'
            },
            'name': {
              '$ref': '#/definitions/nameV1'
            },
            'environment': '#/definitions/environmentV1',
            'appCatalog': '#/definitions/appCatalogV1',
          },
          'additionalProperties': false,
          'required': [
            'apiVersion',
            'name',
            'environment'
          ]
        },
        'DeploymentV1': {
          'type': 'object',
          'properties': {
            'replicas': {
              'description': 'number of replicas to deploy',
              'maximum': 2,
              'minimum': 0,
              'type': 'number'
            },
            'container': {
              '$ref': '#/definitions/containerV1'
            }
          },
          'required': [
            'container'
          ]
        }
      },
      'oneOf': [
        {
          '$ref': '#/definitions/v1beta1'
        },
        {
          '$ref': '#/definitions/v1'
        }
      ],
      'title': 'UNITY App',
      'type': 'object'
    };
    user = partialMock<SimpleUser>({login: 'q123456'});
    issue = freeze(partialMock<Issue>({
      user: user,
      labels: [],
    }));
    jest.spyOn(users, 'getAUser').mockResolvedValue(partialMock<PrivateUser | PublicUser>({login: user.login}));
    jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>({}));
  });
  describe('reviewIssue', () => {
    it('should request approval when issue is ok', async () => {
      issue = addLabel(issue, labels.newApp, issueState.waitingForReview);
      issue = produce(issue, draft => {
        draft.body = `
I wish to run my app in UNITY. Here is the configuration I would like to start with:

\`\`\`yaml
apiVersion: v1beta1
name: my-app-name
environment: test
\`\`\`

*The app's name should be URL compatible, so prefer \`my-app\` over ~~\`MyApp\`~~ or ~~\`my app\`~~.*

**Application Components**

 * [x] please generate a front-end [Angular](https://angular.io) stub from a template for me.
 * [x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.

**The Way We Work Together**

 * [x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html).
        `;
      });
      jest.spyOn(requestApproval, 'requestApproval').mockResolvedValue();
      jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
      jest.spyOn(repositories, 'getRepositoryContent').mockResolvedValue(partialMock<ContentFile>({
        type: 'file',
        content: base64(yaml.dump(schema))
      }));
      await reviewIssue(issue);
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
\`\`\`

**Application Components**

 * [x] please generate a front-end [Angular](http://angular.io) stub from a template for me.
 * [x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.

**The Way We Work Together**

 * [ ] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html).
        `;
      });
      jest.spyOn(removeApprovalRequest, 'removeApprovalRequest').mockResolvedValue();
      jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
      await reviewIssue(issue);
      expect(removeApprovalRequest.removeApprovalRequest).toHaveBeenCalled();
    });
  });
  describe('checkTermsOfService', () => {
    it('should be valid when terms of service are accepted', async () => {
      const newAppIssue = partialMock<NewAppIssue>({
        appSpec: partialMock<AppSpec>({}),
        termsOfServiceAccepted: true
      });
      expect(await checkTermsOfService(issue, newAppIssue)).toBeTruthy();
    });
    it('should not be valid when terms of service are not accepted', async () => {
      const newAppIssue = partialMock<NewAppIssue>({
        appSpec: partialMock<AppSpec>({}),
        termsOfServiceAccepted: false
      });
      expect(await checkTermsOfService(issue, newAppIssue)).toBeFalsy();
    });
  });
  describe('checkAppSchema', () => {
    let appSpec: AppSpecV1Beta1;
    beforeEach(() => {
      appSpec = {
        apiVersion: 'v1beta1',
        name: 'foo',
        environment: 'test'
      };
      jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
      jest.spyOn(repositories, 'getRepositoryContent').mockResolvedValue(partialMock<ContentFile>());
      jest.spyOn(repositories, 'getRepositoryContent').mockResolvedValue(partialMock<ContentFile>({
        type: 'file',
        content: base64(yaml.dump(schema))
      }));
    });
    it('should be valid when schema is valid', async () => {
      const newAppIssue = partialMock<NewAppIssue>({appSpec: appSpec});
      expect(await checkAppSchema(issue, newAppIssue)).toBeTruthy();
    });
    it('should not be valid when schema is not valid', async () => {
      appSpec = produce(appSpec, draft => {
        draft.name = '/';
      });
      const newAppIssue = partialMock<NewAppIssue>({appSpec: appSpec});
      expect(await checkAppSchema(issue, newAppIssue)).toBeFalsy();
      expect(issues.commentOnIssue).toHaveBeenCalledWith(expect.objectContaining({
        body: expect.stringContaining(`\`name\`: does not match pattern "^[a-z0-9]+(?:-[a-z0-9]+)*$"`)
      }));
    });
  });
  describe('checkAppName', () => {
    beforeEach(() => {
      jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([]);
      jest.spyOn(issues, 'commentOnIssue').mockResolvedValue(partialMock<IssueComment>());
    });
    it('should be valid when name is valid', async () => {
      const appSpec = partialMock<AppSpec>({name: 'foo'});
      const newAppIssue = partialMock<NewAppIssue>({appSpec: appSpec});
      expect(await checkAppName(issue, newAppIssue)).toBeTruthy();
    });
    it('should not be valid when name exists', async () => {
      const appSpec = partialMock<AppSpec>({name: 'foo'});
      const newAppIssue = partialMock<NewAppIssue>({appSpec: appSpec});
      jest.spyOn(repositories, 'listOrganizationRepositories').mockResolvedValue([
        partialMock<MinimalRepository>({name: repoName(appSpec.name)})
      ]);
      expect(await checkAppName(issue, newAppIssue)).toBeFalsy();
    });
  });
});
