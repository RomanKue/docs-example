import {Validator, ValidatorResult} from 'jsonschema';

export const validateSchema = (
  objects: unknown | Array<unknown> | undefined, schema: Record<string, unknown>
): string | undefined => {
  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(objects, schema);

  if (validatorResult.errors.length > 0) {
    let mesage = '';
    for (const error of validatorResult.errors) {
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
