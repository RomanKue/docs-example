/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Content = ContentDirectory | ContentFile | SymlinkContent | SubmoduleContent;
/**
 * A list of directory items
 */
export type ContentDirectory = {
  type: 'dir' | 'file' | 'submodule' | 'symlink';
  size: number;
  name: string;
  path: string;
  content?: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
    [k: string]: unknown;
  };
}[];

/**
 * Content File
 */
export interface ContentFile {
  type: 'file';
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
    [k: string]: unknown;
  };
  target?: string;
  submodule_git_url?: string;
}
/**
 * An object describing a symlink
 */
export interface SymlinkContent {
  type: 'symlink';
  target: string;
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
    [k: string]: unknown;
  };
}
/**
 * An object describing a submodule
 */
export interface SubmoduleContent {
  type: 'submodule';
  submodule_git_url: string;
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
    [k: string]: unknown;
  };
}
