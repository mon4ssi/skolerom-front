import { action, computed, observable } from 'mobx';
import { TeachingPath, TeachingPathsList } from 'teachingPath/TeachingPath';
import { USER_SERVICE, UserService } from 'user/UserService';
import { injector } from 'Injector';

import { debounce } from 'utils/debounce';
import { DEBOUNCE_TIME, postperpage } from 'utils/constants';
import { Filter } from 'assignment/Assignment';
import { UserType } from 'user/User';
import { SortingFilter, StoreState } from 'utils/enums';
import { Notification, NotificationTypes } from '../../../components/common/Notification/Notification';
import intl from 'react-intl-universal';
const TEACHING_PATHS_PER_PAGE_IN_LIST = postperpage;

export class TeachingPathsListStore {

  private userService: UserService = injector.get(USER_SERVICE);
  private listTeachingPaths = new TeachingPathsList();

  @observable public teachingPathsState: StoreState = StoreState.PENDING;
  @observable public typeOfTeachingPathsList: string = 'all';

  @observable public paginationTotalPages: number = 1;
  @observable public teachingPathList: Array<TeachingPath> = [];
  @observable public currentTeachingPath?: TeachingPath;
  public teachingPathsForSkeleton: Array<TeachingPath> = new Array(TEACHING_PATHS_PER_PAGE_IN_LIST).fill(new TeachingPath({ id: 0, title: '' }));
  public currentEntityTypeRoute: string = 'teaching-path';

  public debounceWrapper = debounce(this.getTeachingPathsList, DEBOUNCE_TIME);

  @computed
  public get teachingPathsList() {
    return this.teachingPathList;
  }

  @action
  public async getTeachingPathsList() {
    this.teachingPathsState = StoreState.LOADING;

    this.listTeachingPaths.setFiltersPerPage(TEACHING_PATHS_PER_PAGE_IN_LIST);
    let response;
    if (this.userService.getCurrentUser()!.type === UserType.Student) {
      response = await this.listTeachingPaths.getStudentTeachingPathsList();
    } else {
      response = this.typeOfTeachingPathsList === 'all' ?
        await this.listTeachingPaths.getAllTeachingPathsList() :
        await this.listTeachingPaths.getMyTeachingPathsList();
    }
    this.teachingPathList = response.teachingPathsList;
    this.paginationTotalPages = response.total_pages;

    this.teachingPathsState = StoreState.PENDING;
  }

  @action
  public async getTeachingPathDistributeList(filter: Filter) {
    this.teachingPathsState = StoreState.LOADING;
    this.listTeachingPaths.setFiltersPerPage(TEACHING_PATHS_PER_PAGE_IN_LIST);
    const response = await this.listTeachingPaths.getTeachingPathDistributes(filter);
    this.teachingPathList = response.teachingPathsList;
    this.paginationTotalPages = response.total_pages;

    this.teachingPathsState = StoreState.PENDING;
  }

  @action
  public async getTeachingPathListOfStudentInList(studentId: number, filter: Filter) {
    this.teachingPathsState = StoreState.LOADING;
    const response = await this.listTeachingPaths.getTeachingPathListOfStudentInList(studentId);
    this.teachingPathList = response.teachingPathsList;
    this.paginationTotalPages = response.total_pages;
    this.teachingPathsState = StoreState.PENDING;
  }

  @action
  public async copyEntity(id: number): Promise<number> {
    try {
      const copyId = await this.listTeachingPaths.copyTeachingPath(id);
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('teaching_paths_list.copy successfully')
      });
      return copyId;
    } catch (e) {
      throw new Error(`copy teaching path ${e}`);
    }
  }

  @action
  public setTypeOfTeachingPathsList(type: string) {
    this.typeOfTeachingPathsList = type;
  }

  @action
  public async setFiltersPage(number: number) {
    this.listTeachingPaths.setFiltersPage(number);
    await this.getTeachingPathsList();
  }

  public getCurrentUser = () => this.userService.getCurrentUser();

  @computed
  public get filter() {
    return this.listTeachingPaths.filter;
  }

  @computed
  public get currentPage() {
    return this.listTeachingPaths.filter.page;
  }

  @computed
  public get currentEntity() {
    return this.currentTeachingPath!;
  }

  @action
  public setCurrentTeachingPath(id: number) {
    this.currentTeachingPath = this.teachingPathList.find(item => item.id === id)!;
  }

  public hasAssignment(id: number) {
    return !!this.teachingPathList.find(item => item.id === id);
  }

  public resetFilters = () => {
    this.listTeachingPaths.setFiltersGradeID(null);
    this.listTeachingPaths.setFiltersSubjectID(null);
    this.listTeachingPaths.setFiltersSearchQuery('');
    this.listTeachingPaths.setFilterSorting(SortingFilter.CREATION_DATE, SortingFilter.DESC);
  }

  public resetCurrentPage = () => {
    this.listTeachingPaths.setFiltersPage(1);
  }

  @action
  public resetTeachingPathsList = () => {
    this.resetFilters();
    this.resetCurrentPage();
    this.teachingPathList = [];
  }

  public setFiltersGradeID(gradeID: number | null) {
    this.listTeachingPaths.setFiltersGradeID(gradeID);
    this.listTeachingPaths.setFiltersPage(1);
    this.getTeachingPathsList();
  }

  public async setFiltersSubjectID(subjectID: number | null) {
    this.listTeachingPaths.setFiltersSubjectID(subjectID);
    this.listTeachingPaths.setFiltersPage(1);
    this.getTeachingPathsList();
  }

  public async setFiltersSearchQuery(searchQuery: string) {
    this.listTeachingPaths.setFiltersSearchQuery(searchQuery);
    this.listTeachingPaths.setFiltersPage(1);
    this.debounceWrapper();
  }

  public get orderFieldFilterValue() {
    return this.listTeachingPaths.filter.searchQuery;
  }
}
