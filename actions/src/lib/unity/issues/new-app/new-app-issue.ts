import {lexMarkdown} from '../../../mardown/markdown.js';
import {marked} from 'marked';

import * as yaml from 'js-yaml';
import {AppSpec, parseYaml} from '../../app-spec.js';
import * as core from '@actions/core';
import {ReadonlyDeep} from 'type-fest';
import {getRepositoryContent} from '../../../github/api/repos/repositories.js';
import {Content, ContentFile} from '../../../github/api/repos/response/content.js';
import {base64Decode} from '../../../strings/encoding.js';
import Code = marked.Tokens.Code;


/**
 * Parsed, structured representation of the new app issue
 */
export class NewAppIssue {
  constructor(
    public appSpec: undefined | ReadonlyDeep<AppSpec>,
    public termsOfServiceAccepted: boolean,
    public generateAngularStub: boolean,
    public generateQuarkusStub: boolean,
  ) {
  }

}

/**
 * searches for a string ignoring case and whitespace
 */
export const looselyIncludes = (s: string, searchString: string): boolean => {
  s = s.toLowerCase().replace(/\s/g, '');
  searchString = searchString.toLowerCase().replace(/\s/g, '');
  return s.includes(searchString);
};

export const isTermsOfServiceAccepted = (body: string): boolean => {
  return looselyIncludes(body, '[x] I accept the [terms of service]');
};

export const shouldDGenerateAngularStub = (body: string): boolean => {
  return looselyIncludes(body, '[x] please generate a front-end [Angular]');
};

export const shouldGenerateQuarkusStub = (body: string): boolean => {
  return looselyIncludes(body, '[x] please generate a back-end');
};

export const parseIssueBody = (body: string): NewAppIssue => {
  core.info(`parsing issue body`);
  const tokens = lexMarkdown(body);
  const code = tokens.filter(token => token.type == 'code' && token.lang == 'yaml') as Code[];
  const appYaml = code[0]?.text ?? '';
  const parseYamlJson = parseYaml(appYaml);
  if (parseYamlJson?.description === "Here is the description for the app catalog, which will be displayed there. If you don't provide one, the one from Connect IT will be taken.") {
    delete parseYamlJson.description;
  }
  if (parseYamlJson?.displayName === 'Nice App Name') {
    delete parseYamlJson.displayName;
  }
  const appSpec: NewAppIssue['appSpec'] = parseYamlJson;
  const termsOfServiceAccepted = isTermsOfServiceAccepted(body);
  const generateAngularStub = shouldDGenerateAngularStub(body);
  const generateQuarkusStub = shouldGenerateQuarkusStub(body);

  return new NewAppIssue(
    appSpec,
    termsOfServiceAccepted,
    generateAngularStub,
    generateQuarkusStub,
  );
};

const isContentFile = (content: Content): content is ContentFile => {
  return (content as ContentFile).type === 'file';
};

export const loadSchema = async (): Promise<Record<string, unknown>> => {
  const content: Content = await getRepositoryContent({
    repo: 'schema',
    path: 'unity-app.schema.yaml',
    ref: 'main'
  });
  if (isContentFile(content)) {
    const str = base64Decode(content.content);
    return yaml.load(str) as Record<string, unknown>;
  }
  throw new Error(`could not load schema, got ${JSON.stringify(content)} instead`);
};
