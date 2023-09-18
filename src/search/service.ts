import { injector } from 'Injector';
import { Search, Filter, SearchRepo, SEARCH_REPO } from './Search';

export const SEARCH_SERVICE = 'SEARCH_SERVICE';
export class SearchService {
  protected searchRepo: SearchRepo = injector.get<SearchRepo>(SEARCH_REPO);
  public async getDataSearch(filter: Filter) {
    return this.searchRepo.getDataSearch(filter);
  }
}
