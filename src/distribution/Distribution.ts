import { action, computed, observable } from 'mobx';
import moment from 'moment';

import { getYearMonthDayDate } from 'utils/dateFormatter';
import { injector } from 'Injector';
import { StudentLevel } from 'user/student/Student';

export const DISTRIBUTION_REPO = 'DISTRIBUTION_REPO';

export interface DistributionRepo {
  getAssignmentDistributionData: (assignmentId: number) => Promise<Distribution>;
  getTeachingPathDistributionData: (assignmentId: number) => Promise<Distribution>;
  saveAssignmentDistribution: (distribution: Distribution) => Promise<void>;
  saveTeachingPathDistribution: (distribution: Distribution) => Promise<void>;
  assignStudentToAssignment: (assignmentId: string, referralToken: string) => Promise<string>;
  assignStudentToTeachingPath: (teachingPathId: string, referralToken: string) => Promise<string>;
}

interface SchoolArgs {
  id: number;
  groupApiId : string;
  name: string;
  parent: string;
  address: string;
}

export class School {

  protected readonly _id : number;
  protected readonly _groupApiId : string;
  protected readonly _name: string;
  protected readonly _parent: string;
  protected readonly _address: string;

  constructor(args: SchoolArgs) {
    this._id = args.id;
    this._groupApiId = args.groupApiId;
    this._name = args.name;
    this._parent = args.parent;
    this._address = args.address;
  }

  @computed
  public get groupApiId() {
    return this._groupApiId;
  }

  @computed
  public get name() {
    return this._name;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get parent() {
    return this._parent;
  }

  @computed
  public get address() {
    return this._address;
  }
}

interface GrepDataArgs {
  displayName: string;
  code: string;
}

export class GrepData {

  protected readonly _displayName: string;
  protected readonly _code: string;

  constructor(args: GrepDataArgs) {
    this._displayName = args.displayName;
    this._code = args.code;
  }

  @computed
  public get displayName() {
    return this._displayName;
  }

  @computed
  public get code() {
    return this._code;
  }
}

interface LevelArgs {
  id: number;
  wpId: number;
  graduation: number;
}

export interface DistributionStudentArgs {
  id: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  level: LevelArgs;
}

export class DistributionStudent {

  protected readonly _id: number;
  protected readonly _name: string;
  @observable protected _startDate: Date | null = null;
  @observable protected _endDate: Date | null;
  @observable protected _isSelected: boolean;
  @observable protected _level: StudentLevel;

  constructor(args: DistributionStudentArgs) {
    this._id = args.id;
    this._name = args.name;
    this._endDate = args.endDate && getYearMonthDayDate(new Date(String(args.endDate).replace(/ /g, 'T')));
    this._isSelected = !!args.endDate;
    this._level = new StudentLevel(args.level);
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get name() {
    return this._name;
  }

  @computed
  public get startDate() {
    return this._startDate;
  }

  @computed
  public get endDate() {
    return this._endDate;
  }

  @computed
  public get isSelected() {
    return this._isSelected;
  }

  @computed
  public get level() {
    return this._level;
  }

  @action
  public setStartDate = (date: Date) => {
    this._startDate = date;
  }

  @action
  public setEndDate = (date: Date | null) => {
    this._endDate = date;
  }

  @action
  public setIsSelected(isSelected: boolean) {
    this._isSelected = isSelected;
    if (!isSelected) {
      this.setEndDate(null);
    }
  }
}

interface DistributionGroupArgs {
  id: number;
  groupName: string;
  school: SchoolArgs | null;
  grepData: GrepDataArgs | null;
  startDate: Date | null;
  endDate: Date | null;
  students: Array<DistributionStudentArgs>;
}

export class DistributionGroup {

  protected _assignedStudents: Array<DistributionStudent>;
  protected readonly _id: number;
  protected readonly _name: string;
  protected readonly _school: School | null;
  protected readonly _grepData: GrepData | null;
  @observable protected _startDate: Date | null;
  @observable protected _endDate: Date | null;
  @observable protected _isSelected: boolean;
  @observable protected _isSelectedAll: boolean;

  constructor(args: DistributionGroupArgs) {
    this._id = args.id;
    this._name = args.groupName;
    this._school = args.school && new School(args.school);
    this._grepData = args.grepData && new GrepData(args.grepData);
    this._startDate = args.startDate;
    this._endDate = args.endDate && getYearMonthDayDate(new Date(String(args.endDate).replace(/ /g, 'T')));
    this._assignedStudents = args.students.map(
      student => new DistributionStudent(student)
    );
    this._isSelected = !!args.endDate || !!this.assignedStudents.filter(
      student => student.isSelected
    ).length;
    this._isSelectedAll = !!(this.assignedStudents.filter(
      student => student.isSelected
    ).length === args.students.length);
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get name() {
    return this._name;
  }

  @computed
  public get school() {
    return this._school;
  }

  @computed
  public get grepData() {
    return this._grepData;
  }

  @computed
  public get startDate() {
    return this._startDate;
  }

  @computed
  public get endDate() {
    return this._endDate;
  }

  @computed
  public get assignedStudents() {
    return this._assignedStudents;
  }

  @computed
  public get isSelected() {
    return this._isSelected;
  }

  @computed
  public get isSelectedAll() {
    return this._isSelectedAll;
  }

  @computed
  public get numberOfStudents() {
    return this.assignedStudents.length;
  }

  @computed
  public get numberOfSelectedStudents() {
    return this.assignedStudents.filter(
      student => student.isSelected
    ).length;
  }

  @action
  public setStartDate = (date: Date) => {
    this._startDate = date;
  }

  @action
  public setEndDate = (date: Date | null) => {
    this._endDate = date;
  }

  @action
  public setIsSelected = (isSelected: boolean) => {
    this._isSelected = isSelected;
    if (!isSelected) {
      this.setEndDate(null);
    }
  }

  @action
  public setIsSelectedAll = (isSelected: boolean) => {
    this._isSelectedAll = isSelected;
  }

}

interface DistributionArgs {
  id: number;
  startDate: Date | null;
  endDate: Date | null;
  groups: Array<DistributionGroupArgs>;
  referralLink: string;
}

export class Distribution {

  protected repo: DistributionRepo = injector.get(DISTRIBUTION_REPO);

  protected readonly _id: number;
  @observable protected _startDate: Date;
  @observable protected _endDate: Date;
  @observable public _groups: Array<DistributionGroup>;
  protected readonly _referralLink: string;

  constructor(args: DistributionArgs) {
    this._id = args.id;
    this._startDate = getYearMonthDayDate(new Date());
    this._endDate = args.endDate ?
      getYearMonthDayDate(new Date(String(args.endDate).replace(/ /g, 'T'))) :
      getYearMonthDayDate(moment().add(1, 'w').toDate());
    this._groups = args.groups.map(
      group => new DistributionGroup(group)
    );
    this._referralLink = args.referralLink || '';
  }

  private validateSelectedStudents() {
    if (!this.numberOfSelectedStudents) {
      throw new DistributionValidationError(
        'distribution_page.distribution_validation'
      );
    }
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get startDate() {
    return this._startDate;
  }

  @computed
  public get endDate() {
    return this._endDate;
  }

  @computed
  public get groups() {
    return this._groups;
  }

  @computed
  public get referralLink() {
    return this._referralLink;
  }

  @computed
  public get numberOfSelectedStudents() {
    const numberOfSelectedStudentsInGroups = this._groups.map(
      group => group.assignedStudents.filter(
        student => student.isSelected
      ).length
    );

    return numberOfSelectedStudentsInGroups.reduce(
      (selectedStudents, acc) => {
        const newAcc = acc + selectedStudents;
        return newAcc;
      },
      0
    );
  }

  @computed
  public get isValid() {
    try {
      this.validateSelectedStudents();
      return true;
    } catch {
      return false;
    }
  }

  @action
  public setStartDate = (date: Date) => {
    this._startDate = date;
  }

  @action
  public setEndDate = (date: Date) => {
    this._endDate = date;
  }

  @action
  public async distributeAssignment() {
    this.validateSelectedStudents();

    this.repo.saveAssignmentDistribution(this);
  }

  @action
  public async distributeTeachingPath() {
    this.validateSelectedStudents();

    return this.repo.saveTeachingPathDistribution(this);
  }

}

export class DistributionValidationError extends Error {
  public readonly localizationKey: string;

  constructor(localizationKey: string) {
    super(localizationKey);
    this.localizationKey = localizationKey;
  }
}
