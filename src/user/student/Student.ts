import { observable, computed, action } from 'mobx';

import { injector } from 'Injector';

import { User, UserType, UserParams } from 'user/User';
import { StudentService, STUDENT_SERVICE } from 'student/service';

export interface StudentGradeSubject {
  title: string;
}

interface LevelArgs {
  id: number;
  wpId: number;
  graduation: number;
}

export class StudentLevel {

  @observable protected _id: number;
  @observable protected _wpId: number;
  @observable protected _graduation: number;

  constructor(args: LevelArgs = { graduation: 2, id: 2, wpId: 1542 }) {
    this._id = args.id;
    this._wpId = args.wpId;
    this._graduation = args.graduation;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get wpId() {
    return this._wpId;
  }

  @computed
  public get graduation() {
    return this._graduation;
  }
}

export interface StudentLevel {
  id: number;
  wpId: number;
  graduation: number;
}

type StudentParams = UserParams & {
  grades?: Array<StudentGradeSubject>;
  subjects?: Array<StudentGradeSubject>;
  level?: StudentLevel;
};

export class Student extends User {
  public readonly subjects: Array<StudentGradeSubject> = [];
  public readonly grades: Array<StudentGradeSubject> = [];
  @observable public level?: StudentLevel;

  constructor(params: StudentParams) {
    super({ ...params, type: UserType.Student });
    this.grades = params.grades || [];
    this.subjects = params.subjects || [];
    this.level = params.level;
  }

  @action
  public setLevel(level: StudentLevel) {
    this.level = level;
  }
}

export class StudentsList {

  private studentService: StudentService = injector.get(STUDENT_SERVICE);
  public filter: Filter = new Filter();

  public setFiltersPage(number: number) {
    this.filter.page = number;
  }

  public setFiltersPerPage(number: number) {
    this.filter.per_page = number;
  }

  public setFiltersGrade(gradeID: number | null) {
    this.filter.grade = gradeID;
  }

  public setFiltersSubject(subjectID: number | null) {
    this.filter.subject = subjectID;
  }

  public setFiltersSearchQuery(searchQuery: string) {
    this.filter.searchQuery = searchQuery;
  }

  public async getStudentsList() {
    return this.studentService.getStudentsList(this.filter);
  }

}

export class Filter {
  @observable public page?: number | null;
  // tslint:disable-next-line: variable-name
  @observable public per_page?: number | null;
  @observable public searchQuery?: string | null;
  @observable public grade?: number | null;
  @observable public subject?: number | null;
}
