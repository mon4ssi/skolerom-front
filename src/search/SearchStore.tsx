import { action, computed, observable } from 'mobx';
import { Search, Filter, SearchRepo, SEARCH_REPO, FilterMeta } from './Search';
import { SearchService, SEARCH_SERVICE } from './service';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from '../utils/storageInteractor';

import { injector } from 'Injector';
export class SearchStore {
  private searchService: SearchService = injector.get<SearchService>(SEARCH_SERVICE);
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  @observable public scroll: number = 0;
  @observable public paginationTotalPages: number = 1;
  @observable public useFilters: boolean = false;
  @observable public dataitems: any;
  @observable public isFilters: boolean = false;
  @observable public myfilterLang: string | null = null;
  @observable public myfilter: Filter = {
    page: 1,
    per_page: 24,
    localeId: null,
    type: 1,
    grades: [],
    subjects: [],
    coreElements: [],
    topics: [],
    goals: [],
    sources: [],
    readingInSubjects: [],
    searchQuery: ''
  };
  @observable public getFilters?: FilterMeta;
  @action
  public async getDataSearch() {
    this.validIfUsed();
    const data = this.searchService.getDataSearch(this.myfilter);
    this.dataitems = data;
    this.isFilters = false;
    return data;
  }
  @action
  public resetFilters() {
    this.myfilter = {
      page: 1,
      per_page: 24,
      localeId: this.myfilterLang,
      type: 1,
      grades: [],
      subjects: [],
      coreElements: [],
      topics: [],
      goals: [],
      sources: [],
      readingInSubjects: [],
      searchQuery: ''
    };
  }
  public resetLangFilters() {
    this.myfilter = {
      page: 1,
      per_page: 24,
      localeId: this.myfilterLang
    };
  }
  @action
  public validIfUsed() {
    // tslint:disable-next-line:max-line-length
    if (this.myfilter.grades!.length > 0 || this.myfilter.subjects!.length > 0 || this.myfilter.coreElements!.length > 0 || this.myfilter.topics!.length > 0 || this.myfilter.goals!.length > 0 || this.myfilter.sources!.length > 0 || this.myfilter.readingInSubjects!.length > 0) {
      this.useFilters = true;
    }
  }
}
