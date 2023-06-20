import { action, computed, observable } from 'mobx';
import { Search, Filter, SearchRepo, SEARCH_REPO } from './Search';
import { SearchService, SEARCH_SERVICE } from './service';

import { injector } from 'Injector';
export class SearchStore {
  private searchService: SearchService = injector.get<SearchService>(SEARCH_SERVICE);
  @observable public myfilter: Filter = {
    page: 1,
    per_page: 24,
    lang:'eng',
    type: 1
  };
  @action
  public async getDataSearch() {
    return this.searchService.getDataSearch(this.myfilter);
  }
}
