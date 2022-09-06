import {mock} from 'jest-mock-extended';

/**
 * create a mock from an interface and init part of its properties.
 */
export const partialMock = <T>(obj: Partial<T>): T => {
  return {...(mock<T>()), ...obj};
};

