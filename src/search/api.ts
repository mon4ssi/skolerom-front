import { injector } from 'Injector';
import { action, computed, observable, toJS } from 'mobx';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { API } from 'utils/api';
import { Search, Filter, SearchRepo, FilterMeta } from './Search';
import isNil from 'lodash/isNil';

export const buildFilterDTO = (filter: Filter): Object => {
  const filterDTO: { [key: string]: string | number | boolean | Array<string> | Array<number> } = {};
  if (filter.page) {
    filterDTO.page = filter.page;
  }
  if (filter.per_page) {
    filterDTO.per_page = filter.per_page;
  }
  if (filter.localeId) {
    // logic per langs
    filterDTO.locale = filter.localeId;
  }
  if (filter.type) {
    filterDTO.type = filter.type;
  }
  if (filter.searchQuery) {
    filterDTO.query = filter.searchQuery;
  }
  if (filter.grades) {
    filterDTO.grade = (toJS(filter.grades).length > 0) ? String(filter.grades) : toJS(filter.grades);
  }
  if (filter.subjects) {
    filterDTO.subject = (toJS(filter.subjects).length > 0) ? String(filter.subjects) : toJS(filter.subjects);
  }
  if (filter.coreElements) {
    filterDTO.coreElement = (toJS(filter.coreElements).length > 0) ? String(filter.coreElements) : toJS(filter.coreElements);
  }
  if (filter.topics) {
    filterDTO.topic = (toJS(filter.topics).length > 0) ? String(filter.topics) : toJS(filter.topics);
  }
  if (filter.sources) {
    filterDTO.source = (toJS(filter.sources).length > 0) ? String(filter.sources) : toJS(filter.sources);
  }
  if (filter.goals) {
    filterDTO.goal = (toJS(filter.goals).length > 0) ? String(filter.goals) : toJS(filter.goals);
  }
  if (filter.readingInSubjects) {
    filterDTO.readingInSubject = (toJS(filter.readingInSubjects).length > 0) ? String(filter.readingInSubjects) : toJS(filter.readingInSubjects);
  }
  return filterDTO;
};
export class SearchApi implements SearchRepo {
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  public async getDataSearch(filter: Filter): Promise<{items: Array<Search>, filters: FilterMeta, totalpage: number}>  {
    if (!isNil(filter.searchQuery)) filter.searchQuery = String(filter.searchQuery!);
    const response = await API.get(`${process.env.REACT_APP_SEARCH}/api/content`, {
      params: buildFilterDTO(filter)
    });
    /*const response = await API.get(`https://search.skolerom-beta.com/api/content`, {
      params: buildFilterDTO(filter)
    });*/
    // const response = await API.get('https://skolerom.proxy.beeceptor.com/todos');
    return {
      items: response.data.data,
      filters: response.data.filters,
      totalpage: response.data.meta.pagination.totalpages
    };
  }
}
