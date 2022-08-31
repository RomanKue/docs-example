import * as github from "@actions/github";
import * as core from "@actions/core";

const getGithubToken = (): string => {
  const githubToken = core.getInput('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is not defined")
  }
  return githubToken;
}

const githubToken = getGithubToken();

export const octokit = github.getOctokit(githubToken)
