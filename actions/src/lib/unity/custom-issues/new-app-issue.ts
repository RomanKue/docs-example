import {lexMarkdown} from '../../mardown/markdown.js';
import {marked} from 'marked';

import * as yaml from 'js-yaml';
import {AppSpec, parseYaml} from '../app-spec.js';
import {Issue} from '../../github/api/issues/response/issue.js';
import Code = marked.Tokens.Code;
import fs from 'fs';


/**
 *
 */
export class NewAppIssue {
  constructor(
    public appSpec: undefined | AppSpec,
    public termsOfServiceAccepted: boolean,
    public generateAngularStub: boolean,
    public generateQuarkusStub: boolean,
  ) {
  }

}

export const isClosed = (issue: Readonly<Issue>): boolean => {
  return !!issue.closed_at;
};

export const hasLabel = (issue: Readonly<Issue>, label: string): boolean => {
  return issue.labels.map(l => l?.name).includes(label);
};

export const isTermsOfServiceAccepted = (body: string): boolean => {
  return body.includes('[x] I accept the [terms of service](https://pages.atc-github.azure.cloud.bmw/UNITY/unity/Terms-of-Service.html)');
};

export const shouldDGenerateAngularStub = (body: string): boolean => {
  return body.includes('[x] please generate a front-end [Angular](http://angular.io) stub from a template for me.');
};

export const shouldGenerateQuarkusStub = (body: string): boolean => {
  return body.includes('[x] please generate a back-end [Quarkus](https://quarkus.io) stub from a template for me.');
};

export const parseIssueBody = (body: string): NewAppIssue => {
  const tokens = lexMarkdown(body);
  const code = tokens.filter(token => token.type == 'code' && token.lang == 'yaml') as Code[];
  const appYaml = code[0]?.text ?? '';
  const appSpec: NewAppIssue['appSpec'] = parseYaml(appYaml);
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

export const loadSchema = (apiVersion: string, basePath = 'schema'): Object => {
  const path = `${basePath}/unity-app.${apiVersion}.schema.json`;
  const schemaJson = fs.readFileSync(path, 'utf8');
  return JSON.parse(schemaJson);
};
