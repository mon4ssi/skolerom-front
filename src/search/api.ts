import { injector } from 'Injector';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { API } from 'utils/api';
import { Search, Filter, SearchRepo } from './Search';
import isNil from 'lodash/isNil';

export const buildFilterDTO = (filter: Filter): Object => {
  const filterDTO: { [key: string]: string | number | boolean | Array<string> | Array<number> } = {};
  if (filter.page) {
    filterDTO.page = filter.page;
  }
  if (filter.per_page) {
    filterDTO.per_page = filter.per_page;
  }
  if (filter.lang) {
    // logic per langs
    filterDTO.lang = filter.lang;
  }
  if (filter.type) {
    filterDTO.type = filter.type;
  }
  if (filter.searchQuery) {
    filterDTO.searchQuery = filter.searchQuery;
  }
  if (filter.grades) {
    filterDTO.grades = filter.grades;
  }
  if (filter.subjects) {
    filterDTO.subjects = filter.subjects;
  }
  if (filter.coreElements) {
    filterDTO.coreElements = filter.coreElements;
  }
  if (filter.topics) {
    filterDTO.topics = filter.topics;
  }
  if (filter.source) {
    filterDTO.source = filter.source;
  }
  if (filter.goals) {
    filterDTO.goals = filter.goals;
  }
  return filterDTO;
};
export class SearchApi implements SearchRepo {
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  public async getDataSearch(filter: Filter): Promise<Array<Search>>  {
    if (!isNil(filter.searchQuery)) filter.searchQuery = String(filter.searchQuery!);
    /* const response = await API.get('https://searchpoint.free.beeceptor.com/all', {
      params: buildFilterDTO(filter)
    }); */
    const response = await API.get('https://searchpoint.free.beeceptor.com/all');
    return response.data.data;
  }
}
