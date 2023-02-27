import { ReadonlyDeep } from 'type-fest';
import { AppSpec, parseYaml } from '../../app-spec.js';
import * as core from '@actions/core';
import { lexMarkdown } from '../../../mardown/markdown.js';
import {marked} from 'marked';
import Code = marked.Tokens.Code;

export class DecommissionAppIssue {
  constructor (
    public appSpec: undefined | ReadonlyDeep<AppSpec>,
  ) {
  }
}

export const parseIssueBody = (body: string): DecommissionAppIssue => {
  core.info(`parsing issue body`);
  const tokens = lexMarkdown(body);
  const code = tokens.filter(token => token.type == 'code' && token.lang == 'yaml') as Code[];
  const appYaml = code[0]?.text ?? '';
  const appSpec: DecommissionAppIssue['appSpec'] = parseYaml(appYaml);
  return new DecommissionAppIssue(
    appSpec,
  );
};
