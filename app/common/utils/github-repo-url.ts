import { GITHUB_URL_SAMMII } from "../../constants";

const GITHUB_ORG_URL = "https://github.com/unicorn-poo";

// Repos owned by the unicorn-poo org whose project id doesn't carry an "unicorn-poo/" prefix.
const UNICORN_POO_REPO_IDS = new Set(["pizzazz"]);

export const getGithubRepoUrl = (projectId: string): string => {
  if (projectId.startsWith("unicorn-poo/")) {
    return `${GITHUB_ORG_URL}/${projectId.slice("unicorn-poo/".length)}`;
  }
  if (UNICORN_POO_REPO_IDS.has(projectId)) {
    return `${GITHUB_ORG_URL}/${projectId}`;
  }
  return `${GITHUB_URL_SAMMII}/${projectId}`;
};
