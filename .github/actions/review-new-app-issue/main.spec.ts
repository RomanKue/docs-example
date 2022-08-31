import {describe, expect, it, test} from '@jest/globals';
import {parseIssueBody} from './main.js';

describe('parseIssueBody', () => {
  it('should return empty object when issue body is empty', () => {
    expect(parseIssueBody('')).toEqual({});
  });
});
