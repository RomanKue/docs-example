import {validateSchema} from './json-schema.js';
import {loadSchema} from '../unity/issues/new-app/new-app-issue.js';
import {AppSpecV1Beta1} from '../unity/app-spec.js';

describe('json-schema', () => {
  describe('validateSchema', () => {
    let schema: Record<string, unknown>;
    beforeAll(() => {
      schema = loadSchema('v1beta1',);
    });
    let appSpecV1Beta1: AppSpecV1Beta1;
    let container: { image: string; tag: string };
    beforeEach(() => {
      container = {image: 'app-foo', tag: 'bar'};
      appSpecV1Beta1 = {
        apiVersion: 'v1beta1',
        name: 'foo',
        deployments: {
          'ui': {container}
        }
      };
    });
    it('should not fail when object is valid', () => {
      expect(validateSchema(appSpecV1Beta1, schema)).toBeUndefined();
    });
    it('should fail when object is empty', () => {
      expect(validateSchema({}, schema)).toEqual(
        'requires property "apiVersion"\n\n' +
        'requires property "name"\n\n');
    });
    describe('name', () => {
      it('should fail when too short', () => {
        const appSpec: AppSpecV1Beta1 = {
          apiVersion: 'v1beta1',
          name: 'f',
        };
        expect(validateSchema(appSpec, schema)).toEqual(
          '`name`: does not meet minimum length of 3\n\n');
      });
      it('should fail when too long', () => {
        const appSpec: AppSpecV1Beta1 = {
          apiVersion: 'v1beta1',
          name: 'f'.repeat(33),
        };
        expect(validateSchema(appSpec, schema)).toEqual(
          '`name`: does not meet maximum length of 32\n\n');
      });
    });
    describe('deployments', () => {
      describe('name', () => {
        it('should fail when name is invalid', () => {
          const appSpec: AppSpecV1Beta1 = {
            apiVersion: 'v1beta1',
            name: 'foo',
            deployments: {
              'foo/bar': {container}
            }
          };
          expect(validateSchema(appSpec, schema)).toEqual(
            '`deployments`: is not allowed to have the additional property "foo/bar"\n\n');
        });
        it('should fail when too short', () => {
          const appSpec: AppSpecV1Beta1 = {
            apiVersion: 'v1beta1',
            name: 'foo',
            deployments: {
              'f': {container}
            }
          };
          expect(validateSchema(appSpec, schema)).toEqual(
            '`deployments`: does not meet minimum length of 2\n\n');
        });
        it('should fail when too long', () => {
          const appSpec: AppSpecV1Beta1 = {
            apiVersion: 'v1beta1',
            name: 'foo',
            deployments: {
              ['f'.repeat(32)]: {container}
            }
          };
          expect(validateSchema(appSpec, schema)).toEqual(
            '`deployments`: does not meet maximum length of 12\n\n');
        });
      });
      describe('replicas', () => {
        it('should fail when  negative', () => {
          const appSpec: AppSpecV1Beta1 = {
            apiVersion: 'v1beta1',
            name: 'foo',
            deployments: {
              foo: {container, replicas: -1}
            }
          };
          expect(validateSchema(appSpec, schema)).toEqual(
            '`deployments.foo.replicas`: must be greater than or equal to 0\n\n');
        });
        it('should fail when too high', () => {
          const appSpec: AppSpecV1Beta1 = {
            apiVersion: 'v1beta1',
            name: 'foo',
            deployments: {
              foo: {container, replicas: 99}
            }
          };
          expect(validateSchema(appSpec, schema)).toEqual(
            '`deployments.foo.replicas`: must be less than or equal to 2\n\n');
        });
      });
    });
  });
});
