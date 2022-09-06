import { observable, toJS, action, computed } from 'mobx';

import { injector } from 'Injector';
import { Assignment, AssignmentDistributeList, AssignmentList, Grade, Subject } from 'assignment/Assignment';
import { AssignmentService, ASSIGNMENT_SERVICE } from 'assignment/service';
import { debounce } from 'utils/debounce';
import { UserService, USER_SERVICE } from 'user/UserService';
import { DEBOUNCE_TIME } from 'utils/constants';
import { SortingFilter, StoreState } from 'utils/enums';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from '../../../components/common/Notification/Notification';
import intl from 'react-intl-universal';

const ASSIGNMENTS_PER_PAGE_FOR_TEACHING_PATH = 12;
const ASSIGNMENTS_PER_PAGE_IN_LIST = 8;

export class AssignmentListStore {

  @observable private assignmentList: AssignmentList = new AssignmentList();
  @observable private _assignmentDistributeList: AssignmentDistributeList = new AssignmentDistributeList();
  private assignmentService: AssignmentService = injector.get<AssignmentService>(ASSIGNMENT_SERVICE);
  private userService: UserService = injector.get<UserService>(USER_SERVICE);
  @observable public assignmentsState: StoreState = StoreState.PENDING;
  @observable public isFetchedAssignmentsListFinished: boolean = false;
  @observable public myAssignments: Array<Assignment> = [];
  @observable public assignmentsForSkeleton: Array<Assignment> = new Array(ASSIGNMENTS_PER_PAGE_IN_LIST).fill(new Assignment({ id: 0 }));
  @observable public currentAssignment?: Assignment;
  @observable public paginationTotalPages: number = 0;
  @observable public allSubjects: Array<Subject> = [];
  @observable public allGrades: Array<Grade> = [];
  @observable public typeOfAssignmentsList: string = 'all';
  @observable public fromTeachingPath: boolean = false;
  public currentEntityTypeRoute: string = 'assignment';

  public debouceWrapper = debounce(this.getAssignmentsList, DEBOUNCE_TIME);
  public studentDebounceWrapper = debounce(this.getStudentAssignmentList, DEBOUNCE_TIME);

  public setFromTeachingPath(fromTeachingPath: boolean) { // TODO: Remove after adding lazy loader to assignments list
    this.fromTeachingPath = fromTeachingPath;
  }

  public setTypeOfAssignmentsList(type: string) {
    this.typeOfAssignmentsList = type;
  }

  @action
  public async getAssignmentsList() {
    // this.assignmentList.setFiltersPage(0); // Pagination doesn't work with this row
    this.assignmentsState = StoreState.LOADING;
    this.assignmentList.setFiltersSorting(SortingFilter.CREATION_DATE, SortingFilter.DESC);

    if (this.fromTeachingPath) {
      this.assignmentsForSkeleton = new Array(ASSIGNMENTS_PER_PAGE_FOR_TEACHING_PATH).fill(new Assignment({ id: 0 }));
      this.assignmentList.setFiltersPerPage(ASSIGNMENTS_PER_PAGE_FOR_TEACHING_PATH);
    } else {
      this.assignmentList.setFiltersPerPage(ASSIGNMENTS_PER_PAGE_IN_LIST);
    }

    /* const response = this.typeOfAssignmentsList === 'all' ?
      await this.assignmentList.getAllAssignmentsList() :
      await this.assignmentList.getMyAssignmentsList(); */
    let response;
    switch (this.typeOfAssignmentsList) {
      case 'all':
        this.assignmentList.setFilterSchoolAssignments(0);
        response =  await this.assignmentList.getAllAssignmentsList();
        break;
      case 'my':
        this.assignmentList.setFilterSchoolAssignments(0);
        response =  await this.assignmentList.getMyAssignmentsList();
        break;
      case 'myschool':
        this.assignmentList.setFilterSchoolAssignments(1);
        response =  await this.assignmentList.getAllSchoolAssignmentsList();
        break;
      default:
        this.assignmentList.setFilterSchoolAssignments(0);
        response =  await this.assignmentList.getAllAssignmentsList();
        break;
    }

    if (this.fromTeachingPath) {
      this.myAssignments = this.myAssignments.concat(response.myAssignments);
      if (!response.myAssignments.length) {
        this.isFetchedAssignmentsListFinished = true;
      }
    } else {
      this.myAssignments = response.myAssignments;
      this.paginationTotalPages = response.total_pages;
    }

    this.assignmentsState = StoreState.PENDING;
  }

  public async getStudentAssignmentList() {
    this.assignmentsState = StoreState.LOADING;

    const response = await this.assignmentList.getStudentAssignmentList();
    this.myAssignments = response.myAssignments;
    this.paginationTotalPages = response.total_pages;

    this.assignmentsState = StoreState.PENDING;
  }

  public resetCurrentPage = () => {
    this.assignmentList.setFiltersPage(1);
  }

  public getCurrentUser = () => (
    this.userService.getCurrentUser()
  )

  public resetFilters = () => {
    const currentUserType = this.userService.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher) {
      this.assignmentList.setFiltersGradeID(null);
      this.assignmentList.setFiltersSubjectID(null);
      this.assignmentList.setFiltersSorting(SortingFilter.CREATION_DATE, SortingFilter.DESC);
    }
    if (currentUserType === UserType.Student) {
      this.assignmentList.setFiltersIsAnswered(null);
      this.assignmentList.setFiltersIsEvaluated(null);
      this.assignmentList.setFiltersSorting(SortingFilter.DEADLINE, SortingFilter.ASC);
    }
    this.assignmentList.setFiltersPage(1);
    this.assignmentList.setFiltersSearchQuery('');
  }

  @computed
  public get filter() {
    return this.assignmentList.filter;
  }

  @computed
  public get currentPage() {
    return this.assignmentList.filter.page;
  }

  @computed
  public get currentEntity() {
    return this.currentAssignment!;
  }

  @computed
  public get assignmentDistributeList(): AssignmentDistributeList {
    return this._assignmentDistributeList;
  }

  @computed
  public get numberOfAssignmentsPerPage() {
    return this.assignmentList.filter.per_page;
  }

  public setCurrentAssignment(id: number) {
    this.currentAssignment = this.myAssignments.find(item => item.id === id)!;
  }

  @action
  public setCurrentAssignmentEntity(assignment: Assignment) {
    this.currentAssignment = assignment!;
  }

  public hasAssignment(id: number) {
    return !!this.myAssignments.find(item => item.id === id);
  }

  public async getSubjects() {
    this.allSubjects = await this.assignmentService.getSubjects();
  }

  public getAllSubjects() {
    return toJS(this.allSubjects);
  }

  public async getGrades() {
    this.allGrades = await this.assignmentService.getGrades();
  }

  public getAllGrades() {
    return toJS(this.allGrades);
  }

  public getAllMyAssignments() {
    return this.myAssignments;
  }

  public async setFiltersPage(number: number) {
    this.assignmentList.setFiltersPage(number);
    this.userService.getCurrentUser()!.type === UserType.Student ?
      this.getStudentAssignmentList() :
      this.getAssignmentsList();
  }

  public setFiltersPerPage(number: number) {
    this.assignmentList.setFiltersPerPage(number);
    this.getAssignmentsList();
  }

  public setFiltersIsPublished(number: number, withoutRefetch?: boolean) {
    this.assignmentList.setFiltersPage(1);
    this.assignmentList.setFiltersIsPublished(number);
    if (!withoutRefetch) {
      this.getAssignmentsList();
    }
  }

  public async setFiltersSorting(orderField: string, order: string) {
    this.assignmentList.setFiltersSorting(orderField, order);
    this.assignmentList.setFiltersPage(1);
    return this.userService.getCurrentUser()!.type === UserType.Student ?
      this.getStudentAssignmentList() :
      this.getAssignmentsList();
  }

  public setFiltersLocale(locale: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersLocale(locale);
    this.assignmentList.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public setFiltersGradeID(gradeID: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersGradeID(gradeID);
    this.assignmentList.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public async setFiltersSubjectID(subjectID: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersSubjectID(subjectID);
    this.assignmentList.setFiltersPage(1);
    this.userService.getCurrentUser()!.type === UserType.Student ?
      this.getStudentAssignmentList() :
      this.getAssignmentsList();
  }

  public setFiltersMultiID(multiID: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersMultiID(multiID);
    this.assignmentList.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public setFiltersReadingID(readingID: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersReadingID(readingID);
    this.assignmentList.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public setFiltersIsEvaluated(status: string | null) {
    this.assignmentList.setFiltersIsEvaluated(status);
    this.assignmentList.setFiltersPage(1);
    this.getStudentAssignmentList();
  }

  public setFiltersIsAnswered(status: string | null) {
    this.assignmentList.setFiltersIsAnswered(status);
    this.assignmentList.setFiltersPage(1);
    this.getStudentAssignmentList();
  }

  public setFiltersCoreID(coreID: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersCoreID(coreID);
    this.assignmentList.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public setFiltersGoalID(goalID: string | number | null) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersGoalID(goalID);
    this.assignmentList.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public async setFiltersSearchQuery(searchQuery: string) {
    this.clearMyAssignmentsList();
    this.assignmentList.setFiltersSearchQuery(searchQuery);
    this.assignmentList.setFiltersPage(1);
    (this.userService.getCurrentUser())!.type === UserType.Student ?
      this.studentDebounceWrapper() :
      this.debouceWrapper();
  }

  public async setFilterSorting(orderField: string, order: string) {
    this.assignmentList.setFiltersSorting(orderField, order);
    this.assignmentList.setFiltersPage(1);
    this.userService.getCurrentUser()!.type === UserType.Student ?
      this.getStudentAssignmentList() :
      this.getAssignmentsList();
  }

  public setFilterShowMyAssignments(status: number | null) {
    this.assignmentList.setFilterShowMyAssignments(status);
  }

  public async setFiltersForTeachingPath() {
    this.assignmentList.setFiltersPage(1);
    this.assignmentList.setFiltersIsPublished(1);
    this.assignmentList.setFiltersSearchQuery('');
    this.assignmentList.setFiltersPerPage(ASSIGNMENTS_PER_PAGE_IN_LIST);

    this.getAssignmentsList();
  }

  @action
  public clearMyAssignmentsList() {
    this.myAssignments = [];
  }

  @action
  public removeAssignment = async (assignmentId: number) => {
    await this.assignmentService.removeAssignment(assignmentId);
    this.myAssignments = this.myAssignments.filter(assignment => assignment.id !== assignmentId);

    if (this.myAssignments.length) {
      this.getAssignmentsList();
    } else {
      this.setFiltersPage(this.assignmentList.filter.page! - 1);
    }
    await this.getAssignmentsList();
  }

  public async copyEntity(id: number) {
    try {
      const copyId = await this.assignmentService.copyAssignment(id);
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('assignment list.copy')
      });
      return copyId;
    } catch (e) {
      throw new Error(`copy assignment ${e}`);
    }
  }

  public async getGrepFiltersAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string) {
    return this.assignmentService.getGrepFiltersAssignment(locale, grades, subjects, coreElements, goals);
  }

  public get gradeFilterValue() {
    return this.assignmentList.filter.grade;
  }

  public get subjectFilterValue() {
    return this.assignmentList.filter.subject;
  }

  public get searchQueryFilterValue() {
    return this.assignmentList.filter.searchQuery;
  }
}
