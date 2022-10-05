import {Validator, ValidatorResult} from 'jsonschema';

const validationMessage = (validatorResult: ValidatorResult) => {
  let message = '';
  for (const error of validatorResult.errors) {
    const path = error.path.join('.');
    let prefix = '';
    if (path) {
      prefix = `\`${path}\`: `;
    }
    message += `${prefix}${error.message}\n\n`;
  }
  return message;
};
export const validateSchema = (
  objects: unknown | Array<unknown> | undefined, schema: Record<string, unknown>
): string | undefined => {
  const validator = new Validator();
  let validatorResult: ValidatorResult = validator.validate(objects, schema);

  if (validatorResult.errors.length > 0) {
    // in case of errors, try to get more detailed errors by validating on the specific API version
    const apiVersion = (objects as { apiVersion?: string }).apiVersion;
    if (apiVersion && Object.keys(schema.definitions as Record<string, unknown>).includes(apiVersion)) {
      schema = {
        ...schema,
        $ref: `#/definitions/${apiVersion}`
      };
      const apiVersingSpecificValidationResult = validator.validate(objects, schema);
      if (apiVersingSpecificValidationResult.errors.length > 0) {
        validatorResult = apiVersingSpecificValidationResult;
      }
    }
    return validationMessage(validatorResult);
  }
  return undefined;
};

