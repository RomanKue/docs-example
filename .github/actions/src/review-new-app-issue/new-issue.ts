import {lexMarkdown} from '../lib/markdown.js';
import {marked} from 'marked';
import Code = marked.Tokens.Code;

import * as yaml from 'js-yaml';
import * as core from '@actions/core';
import {AppSpec, AppSpecV1Beta1, isV1Beta1} from '../lib/unity/app-spec.js';


/**
 *
 */
export class NewAppIssue {
  constructor(
    public appSpec: undefined | AppSpec & Partial<AppSpecV1Beta1>,
    public termsOfServiceAccepted: boolean,
    public generateAngularStub: boolean,
    public generateQuarkusStub: boolean,
  ) {
  }

}

export const isTermsOfServiceAccepted = (body: string): boolean => {
  return body.indexOf('[x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html)') >= 0;
};

export const shouldDGenerateAngularStub = (body: string): boolean => {
  return body.indexOf('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.') >= 0;
};

export const shouldGenerateQuarkusStub = (body: string): boolean => {
  return body.indexOf('[x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.') >= 0;
};

export const parseIssueBody = (body: string): NewAppIssue => {
  const tokens = lexMarkdown(body);
  const code = tokens.filter(token => token.type == 'code' && token.lang == 'yaml') as Code[];
  const appYaml = code[0]?.text ?? '';
  let appSpec: NewAppIssue['appSpec']
  try {
    appSpec = yaml.load(appYaml) as typeof appSpec;
  } catch (e) {
    core.summary.addRaw(`The following yaml could not be parsed:`, true);
    core.summary.addCodeBlock(appYaml, 'yaml');
    if (e instanceof Error && e.message) {
      core.summary.addRaw(`it failed with: `, true);
      core.summary.addQuote(`${e.message}`);
    }
  }

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

