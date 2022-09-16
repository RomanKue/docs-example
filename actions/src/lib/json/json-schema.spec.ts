import {validateSchema} from './json-schema.js';
import {loadSchema} from '../unity/issues/new-app/new-app-issue.js';
import {AppSpecV1Beta1} from '../unity/app-spec.js';

describe('json-schema', () => {
  describe('validateSchema', () => {
    let schema: Record<string, unknown>;
    beforeAll(() => {
      schema = loadSchema('v1beta1',);
    });
    it('should fail when object is empty', () => {
      expect(validateSchema({}, schema)).toEqual(
        'requires property "apiVersion"\n\n' +
        'requires property "name"\n\n');
    });
    it('should fail when replicas are negative', () => {
      const appSpec: AppSpecV1Beta1 = {
        apiVersion: 'v1beta1',
        name: 'foo',
        deployments: {
          foo: {replicas: -1}
        }
      };
      expect(validateSchema(appSpec, schema)).toEqual(
        '`deployments.foo.replicas`: must be greater than or equal to 0\n\n');
    });
    it('should fail when replicas are too high', () => {
      const appSpec: AppSpecV1Beta1 = {
        apiVersion: 'v1beta1',
        name: 'foo',
        deployments: {
          foo: {replicas: 99}
        }
      };
      expect(validateSchema(appSpec, schema)).toEqual(
        '`deployments.foo.replicas`: must be less than or equal to 2\n\n');
    });
    it('should fail when deployment name is invalid', () => {
      const appSpec: AppSpecV1Beta1 = {
        apiVersion: 'v1beta1',
        name: 'foo',
        deployments: {
          'foo/bar': {replicas: 1}
        }
      };
      expect(validateSchema(appSpec, schema)).toEqual(
        '`deployments`: is not allowed to have the additional property "foo/bar"\n\n');
    });
  });
});
