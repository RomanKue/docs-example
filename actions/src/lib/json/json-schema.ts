import {Validator, ValidatorResult} from 'jsonschema';

export const validateSchema = (objects: Object | Array<unknown> | undefined, schema: Object): string | undefined => {
  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(objects, schema);

  if (validatorResult.errors.length > 0) {
    let mesage = '';
    for (let error of validatorResult.errors) {
      const path = error.path.join('.');
      let prefix = '';
      if (path) {
        prefix = `\`${path}\`: `;
      }
      mesage += `${prefix}${error.message}\n\n`;
    }
    return mesage;
  }
  return undefined;
};
