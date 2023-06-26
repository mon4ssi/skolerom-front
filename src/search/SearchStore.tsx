import { action, computed, observable } from 'mobx';
import { Search, Filter, SearchRepo, SEARCH_REPO, FilterMeta } from './Search';
import { SearchService, SEARCH_SERVICE } from './service';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from '../utils/storageInteractor';

import { injector } from 'Injector';
export class SearchStore {
  private searchService: SearchService = injector.get<SearchService>(SEARCH_SERVICE);
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  @observable public paginationTotalPages: number = 1;
  @observable public useFilters: boolean = false;
  @observable public myfilterLang: string | null = this.storageInteractor.getCurrentLocale();
  @observable public myfilter: Filter = {
    page: 1,
    per_page: 24,
    lang: this.myfilterLang,
    type: 1,
    grades: [],
    subjects: [],
    coreElements: [],
    topics: [],
    goals: [],
    source: [],
    searchQuery: ''
  };
  @observable public getFilters?: FilterMeta;
  @action
  public async getDataSearch() {
    this.validIfUsed();
    return this.searchService.getDataSearch(this.myfilter);
  }
  @action
  public resetFilters() {
    this.myfilter = {
      page: 1,
      per_page: 24,
      lang: this.myfilterLang,
      type: 1,
      grades: [],
      subjects: [],
      coreElements: [],
      topics: [],
      goals: [],
      source: [],
      searchQuery: ''
    };
  }
  @action
  public validIfUsed() {
    if (this.myfilter.grades!.length > 0 || this.myfilter.subjects!.length > 0 || this.myfilter.coreElements!.length > 0 || this.myfilter.topics!.length > 0 || this.myfilter.goals!.length > 0 || this.myfilter.source!.length > 0) {
      this.useFilters = true;
    }
  }
}
