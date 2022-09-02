import {loadSchema} from './unity/custom-issues/new-app-issue';
import {validateSchema} from './json-schema';
import {AppSpecV1Beta1} from './unity/app-spec';

describe('json-schema', () => {
  describe('validateSchema', () => {
    let schema: Object;
    beforeAll(() => {
      schema = loadSchema('v1beta1', '../schema');
    });
    it('should fail when object is empty', () => {
      expect(validateSchema({}, schema)).toEqual(
        'requires property "apiVersion"\n\n' +
        'requires property "name"\n\n' +
        'requires property "members"\n\n');
    });
    it('should fail when members is empty', () => {
      const appSpec: AppSpecV1Beta1 = {
        apiVersion: 'v1beta1',
        name: 'foo',
        members: [],
      };
      expect(validateSchema(appSpec, schema)).toEqual(
        '`members`: does not meet minimum length of 1\n\n');
    });
    it('should fail when the same member is mentioned twice', () => {
      const appSpec: AppSpecV1Beta1 = {
        apiVersion: 'v1beta1',
        name: 'foo',
        members: [
          {qNumber: 'q123456'},
          {qNumber: 'q123456'}
        ],
      };
      expect(validateSchema(appSpec, schema)).toEqual(
        '`members`: contains duplicate item\n\n');
    });
  });
});
