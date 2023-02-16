import {getOctokitApi} from '../../octokit.js';
import {RestApi} from '../rest.js';
import {RepoSearchResultItem} from './response/repo-search-result-item.js';

type SearchApi = RestApi['search'];

/**
 * see https://docs.github.com/en/rest/search#search-repositories
 *
 * It also takes care with encoding the search query.
 * see https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories
 */
export const searchRepositories = async (
  options: {
    q: string,
  } & Partial<Parameters<SearchApi['repos']>[0]>
): Promise<RepoSearchResultItem[]> => {
  let repos: RepoSearchResultItem[] = [];
  let pagesRemaining = false;
  const numberOfResultsPerPages = 100;
  let page = 1;
  do {
    const response = await getOctokitApi().rest.search.repos({
      per_page: numberOfResultsPerPages,
      page,
      ...options
    });
    const responseData = response.data.items as RepoSearchResultItem[];
    pagesRemaining = responseData.length >= numberOfResultsPerPages;
    page++;
    repos = [...repos, ...responseData];
  } while (pagesRemaining);
  return repos;
};
