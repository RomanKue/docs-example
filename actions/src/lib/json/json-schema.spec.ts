import {validateSchema} from './json-schema.js';
import {AppSpecV1Beta1} from '../unity/app-spec.js';

describe('json-schema', () => {
  describe('validateSchema', () => {
    let schema: Record<string, unknown>;
    beforeAll(() => {
      schema = {
        properties: {
          apiVersion: {
            type: 'string'
          }
        },
        required: ['apiVersion']
      };
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
        },
        environment:'test'
      };
    });
    it('should not fail when object is valid', () => {
      expect(validateSchema(appSpecV1Beta1, schema)).toBeUndefined();
    });
    it('should fail when object is empty', () => {
      expect(validateSchema({}, schema)).toContain(
        'requires property "apiVersion"');
    });
  });
});
