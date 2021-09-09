import { action, observable, computed } from 'mobx';
import isNil from 'lodash/isNil';

import { injector } from 'Injector';
import { STUDENT_SERVICE, StudentService } from 'student/service';
import { Student, StudentsList, StudentLevel } from 'user/student/Student';
import { AssignmentList, Assignment, Grade, Subject } from 'assignment/Assignment';
import { TeachingPath, TeachingPathsList } from 'teachingPath/TeachingPath';
import { USER_SERVICE, UserService } from 'user/UserService';

import { debounce } from 'utils/debounce';
import { DEBOUNCE_TIME } from 'utils/constants';
import { Locales, StoreState } from 'utils/enums';

const ASSIGNMENTS_PER_PAGE = 10;
const STUDENTS_PER_PAGE = 8;

export class StudentsListStore {

  private userService: UserService = injector.get(USER_SERVICE);
  private studentService: StudentService = injector.get(STUDENT_SERVICE);
  private studentsListService = new StudentsList();
  private assignmentsListService: AssignmentList = new AssignmentList();
  private TeachingPathsListService: TeachingPathsList = new TeachingPathsList();

  @observable public studentsListState: StoreState = StoreState.PENDING;
  @observable public studentsList: Array<Student> = [];
  @observable public studentsListForSkeleton: Array<Student> = new Array(STUDENTS_PER_PAGE).fill(new Student({ id: 0, name: '', photo: '' , schools: [] }));
  @observable public totalPages: number = 0;
  @observable public currentStudent: Student | null = null;

  @observable public assignmentsListState: StoreState = StoreState.PENDING;
  @observable public teachingPathListState: StoreState = StoreState.PENDING;
  @observable public assignmentsList: Array<Assignment> = [];
  @observable public teachingpathList: Array<TeachingPath> = [];
  @observable public assignmentsListForSkeleton: Array<Assignment> = new Array(ASSIGNMENTS_PER_PAGE).fill(new Assignment({ id: 0 }));
  @observable public paginationTotalPages: number = 0;

  @observable public gradesList: Array<Grade> = [];
  @observable public subjectsList: Array<Subject> = [];
  @observable public levelsList: Array<StudentLevel> = [];

  public studentsDebounceWrapper = debounce(this.getStudentsList, DEBOUNCE_TIME);
  public assignmentsDebounceWrapper = debounce(this.getAssignmentsList, DEBOUNCE_TIME);
  public teachingPathDebounceWrapper = debounce(this.getTeachingPathList, DEBOUNCE_TIME);

  @computed
  public get filter() {
    return this.studentsListService.filter;
  }

  @computed
  public get currentAssignmentListPage(): number {
    return !isNil(this.assignmentsListService.filter.page) ? this.assignmentsListService.filter.page : 1;
  }

  @computed
  public get currentTeachingpathListPage(): number {
    return !isNil(this.TeachingPathsListService.filter.page) ? this.TeachingPathsListService.filter.page : 1;
  }

  @action
  public async getStudentsList() {
    this.studentsListState = StoreState.LOADING;

    const response = await this.studentsListService.getStudentsList();
    this.studentsList = response.students;
    this.totalPages = response.total_pages;

    this.studentsListState = StoreState.PENDING;
  }

  public async setFiltersPage(number: number) {
    this.studentsListService.setFiltersPage(number);
    this.getStudentsList();
  }

  public setFiltersPerPage(number: number) {
    this.studentsListService.setFiltersPerPage(number);
    this.getStudentsList();
  }

  public setFiltersGrade(grade: number | null) {
    this.studentsListService.setFiltersGrade(grade);
    this.studentsListService.setFiltersPage(1);
    this.getStudentsList();
  }

  public async setFiltersSubject(subject: number | null) {
    this.studentsListService.setFiltersSubject(subject);
    this.studentsListService.setFiltersPage(1);
    this.getStudentsList();
  }

  public async setFiltersSearchQuery(searchQuery: string) {
    this.studentsListService.setFiltersSearchQuery(searchQuery);
    this.studentsListService.setFiltersPage(1);
    this.studentsDebounceWrapper();
  }

  public async changeStudentLevel(studentId: number, levelId: number) {
    this.studentService.changeStudentLevel(studentId, levelId);
  }

  @action
  public clearAssignmentsList() {
    this.assignmentsList = [];
  }

  @action
  public clearTeachingPathList() {
    this.teachingpathList = [];
  }

  @action
  public async getAssignmentsList() {
    this.assignmentsListState = StoreState.LOADING;
    this.TeachingPathsListService.setFiltersPerPage(ASSIGNMENTS_PER_PAGE);
    const response = await this.assignmentsListService.getAssignmentListOfStudentInList(this.currentStudent!.id);
    this.assignmentsList = response.myAssignments;
    this.paginationTotalPages = response.total_pages;
    this.assignmentsListState = StoreState.PENDING;
  }

  @action
  public async getTeachingPathList() {
    this.teachingPathListState = StoreState.LOADING;
    this.assignmentsListService.setFiltersPerPage(ASSIGNMENTS_PER_PAGE);
    const response = await this.TeachingPathsListService.getTeachingPathListOfStudentInList(this.currentStudent!.id);
    this.teachingpathList = response.teachingPathsList;
    this.paginationTotalPages = response.total_pages;
    this.teachingPathListState = StoreState.PENDING;
  }

  public setFiltersIsEvaluated(isEvaluated: string | null) {
    this.assignmentsListService.setFiltersIsEvaluated(isEvaluated);
    this.assignmentsListService.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public setFiltersIsAnswered(status: string | null) {
    this.assignmentsListService.setFiltersIsAnswered(status);
    this.assignmentsListService.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public async setAssignmentsFiltersPage(number: number) {
    if (this.paginationTotalPages === this.currentAssignmentListPage) {
      return null;
    }
    this.assignmentsListService.setFiltersPage(number);
    this.assignmentsListState = StoreState.LOADING;
    this.assignmentsListService.setFiltersPerPage(ASSIGNMENTS_PER_PAGE);
    const response = await this.assignmentsListService.getAssignmentListOfStudentInList(this.currentStudent!.id);

    this.assignmentsList = this.assignmentsList.concat(response.myAssignments);
    this.paginationTotalPages = response.total_pages;
    this.assignmentsListState = StoreState.PENDING;
  }

  public async setTeachingPathFiltersPage(number: number) {
    if (this.paginationTotalPages === this.currentTeachingpathListPage) {
      return null;
    }
    this.TeachingPathsListService.setFiltersPage(number);
    this.teachingPathListState = StoreState.LOADING;
    this.TeachingPathsListService.setFiltersPerPage(ASSIGNMENTS_PER_PAGE);
    const response = await this.TeachingPathsListService.getTeachingPathListOfStudentInList(this.currentStudent!.id);

    this.teachingpathList = this.teachingpathList.concat(response.teachingPathsList);
    this.paginationTotalPages = response.total_pages;
    this.teachingPathListState = StoreState.PENDING;
  }

  public async setAssignmentsFiltersSearchQuery(searchQuery: string) {
    this.assignmentsListService.setFiltersSearchQuery(searchQuery);
    this.assignmentsListService.setFiltersPage(1);
    this.assignmentsDebounceWrapper();
  }

  public async setAssignmentsFilterSorting(orderField: string, order: string) {
    this.assignmentsListService.setFiltersSorting(orderField, order);
    this.assignmentsListService.setFiltersPage(1);
    this.getAssignmentsList();
  }

  public async getStudentAdditionalData() {
    const response = await this.studentService.getStudentAdditionalData();
    this.gradesList = response.grades;
    this.subjectsList = response.subjects;
    this.levelsList = response.levels;
  }

  public getCurrentLocale() {
    return this.userService.getCurrentLocale() || Locales.EN;
  }

  public resetFilters() {
    this.assignmentsListService.setFiltersPage(0);
    this.assignmentsListService.setFiltersIsAnswered(null);
    this.assignmentsListService.setFiltersIsEvaluated(null);
    this.assignmentsListService.setFiltersSearchQuery('');
  }
}
