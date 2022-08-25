import { computed, observable, toJS } from 'mobx';
import intl from 'react-intl-universal';

import { Grade, GreepElements, Subject, Article, Assignment, Attachment, Domain, Filter, FilterArticlePanel, FilterGrep, GoalsData, Source, NowSchool, SourceItem, CoreElementItem, EducationalGoalItem, GenericGrepItem } from 'assignment/Assignment';
import { TEACHING_PATH_SERVICE, TeachingPathService } from './service';
import { injector } from '../Injector';

import { secondLevel } from 'utils/constants';
import { Breadcrumbs } from './teachingPathDraft/TeachingPathDraft';
import { isNil } from 'lodash';
import { timeStamp } from 'console';

export const TEACHING_PATH_REPO = 'TEACHING_PATH_REPO';

export interface TeachingPathRepo {
  getAllTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }>;
  getTeachingPathDistributes(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }>;
  getTeachingPathListOfStudentInList(studentId: number, filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }>;
  getMyTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }>;
  getMySchoolTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }>;
  getStudentTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }>;
  getTeachingPathDataById(id: number): Promise<TeachingPath>;
  getTeachingPathById(id: number): Promise<TeachingPath>;
  getCurrentNode(teachingPathId: number, nodeId: number): Promise<TeachingPathNode>;
  markAsPickedArticle(teachingPathId: number, nodeId: number, idArticle: number, levelWpId: number): Promise<void>;
  sendDataDomain(domain: string): Promise<Domain>;
  getFiltersArticlePanel(lang: string): Promise<FilterArticlePanel>;
  getGrepFilters(grades: string, subjects: string, coreElements?: string, $goals?: string): Promise<FilterGrep>;
  getGrepFiltersTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?: string, $goals?: string, source?: string): Promise<FilterGrep>;
  /* tslint:disable-next-line:max-line-length */
  getGrepGoalsFilters(grepCoreElementsIds: Array<number>, grepMainTopicsIds: Array<number>, gradesIds: Array<number>, subjectsIds: Array<number>, orderGoalsCodes: Array<string>, perPage: number, page: number): Promise<{ data: Array<GoalsData>, total_pages: number; }>;
  finishTeachingPath(id: number): Promise<void>;
  fetchImages(postIds: Array<number>): Promise<Array<Attachment>>;
  deleteTeachingPathAnswers(teachingPathId: number, answerId: number): Promise<void>;
  copyTeachingPath(id: number): Promise<number>;
  getGradeWpIds(gradeWpIds: Array<number>): Promise<Array<Grade>>;
  getSubjectWpIds(subjectWpIds: Array<number>): Promise<Array<Subject>>;
  downloadTeacherGuidancePDF(id: number): Promise<void>;
}

export enum TeachingPathNodeType {
  Root = 'ROOT',
  Article = 'ARTICLE',
  Assignment = 'ASSIGNMENT',
  Domain = 'DOMAIN'
}

export type TeachingPathItemValueArgs = {
  id: number;
  title: string;
  description?: string;
  grades?: Array<Grade>;
  url?: string;
  excerpt?: string;
  imageUrl?: string;
  wpId?: number;
  isAnswered?: boolean;
  featuredImage?: string;
  grepGoals?: Array<GreepElements>;
  hasGuidance?: boolean;
  open?: boolean;
  numberOfArticles?: number;
  numberOfQuestions?: number;
};

export type TeachingPathItemValue = Article | Assignment | Domain;

export interface TeachingPathItemArgs {
  type: TeachingPathNodeType;
  value: TeachingPathItemValueArgs;
}

export class TeachingPathItem {

  @observable protected _type: TeachingPathNodeType;
  @observable protected _value: TeachingPathItemValue;

  constructor(args: TeachingPathItemArgs) {
    this._type = args.type;
    this._value = new Article(args.value);
    if (args.type === TeachingPathNodeType.Article) {
      this._value = new Article(args.value);
    }
    if (args.type === TeachingPathNodeType.Assignment) {
      this._value = new Assignment(args.value);
    }
    if (args.type === TeachingPathNodeType.Domain) {
      this._value = new Domain(args.value);
    }
  }

  @computed
  public get type() {
    return this._type;
  }

  @computed
  public get value() {
    return this._value;
  }
}

export interface TeachingPathNodeArgs {
  id?: number;
  type: TeachingPathNodeType;
  selectQuestion: string | null;
  guidance: string | null;
  items: Array<TeachingPathItemValue> | null;
  children: Array<TeachingPathNodeArgs>;
  nestedOrder?: number;
  breadcrumbs?: Array<Breadcrumbs>;
}

export class TeachingPathNode {

  protected readonly _id?: number;
  @observable protected _type: TeachingPathNodeType;
  @observable protected _items: Array<TeachingPathItem> | null;
  @observable protected _children: Array<TeachingPathNode>;
  @observable protected _selectQuestion: string;
  @observable protected _guidance: string;
  @observable protected _breadcrumbs?: Array<Breadcrumbs>;

  constructor(args: TeachingPathNodeArgs) {
    this._id = args.id;
    this._type = args.type;
    this._items = args.items && args.items.map(value => new TeachingPathItem({ value, type: args.type }));
    this._children = args.children ? args.children.map(node => new TeachingPathNode(node)) : [];
    this._selectQuestion = args.selectQuestion || intl.get('edit_teaching_path.paths.node_teaching_path_title');
    this._guidance = args.guidance || '';
    this._breadcrumbs = args.breadcrumbs;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get type() {
    return this._type;
  }

  @computed
  public get items() {
    return this._items;
  }

  @computed
  public get children() {
    return this._children;
  }

  @computed
  public get selectQuestion() {
    return this._selectQuestion;
  }

  @computed
  public get guidance() {
    return this._guidance;
  }

  @computed
  public get breadcrumbs() {
    return this._breadcrumbs;
  }

}

export interface TeachingPathArgs {
  id: number;
  title: string;
  author?: string;
  authorAvatar?: string;
  createdAt?: string | null;
  rootNodeId?: number;
  lastSelectedNodeId?: number;
  content?: TeachingPathNodeArgs | null;
  description?: string;
  guidance?: string;
  hasGuidance?: boolean;
  isPrivate?: boolean;
  isMySchool?: boolean;
  mySchools?: string | undefined;
  isFinished?: boolean;
  maxNumberOfSteps?: number;
  minNumberOfSteps?: number;
  grades?: Array<Grade>;
  subjects?: Array<Subject>;

  subjectItems?: Array<GenericGrepItem>;
  sourceItems?: Array<GenericGrepItem>;
  coreElementItems?: Array<GenericGrepItem>;
  multiSubjectItems?: Array<GenericGrepItem>;
  goalsItems?: Array<GenericGrepItem>;

  sources?: Array<number>;
  keywords?: Array<string>;
  view?: string;
  levels?: Array<number>;
  featuredImage?: string;
  backgroundImage?: string;
  url?: string;
  answerId?: number;
  isPassed?: boolean | null;
  mark?: number | null;
  status?: boolean | null;
  comment?: string;
  isChanged?: boolean;
  isEvaluated?: boolean;
  isSelected?: boolean;
  isCreatedByContentManager?: boolean;
  deadline?: Date;
  isAnswered?: boolean;
  isPublished?: boolean;
  isDistributed?: boolean;
  ownedByMe?: boolean;
  isCopy?: boolean;
  grepMainTopicsIds?: Array<number>;
  grepCoreElementsIds?: Array<number>;
  grepReadingInSubjectsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  grepGoals?: Array<GreepElements>;
  open?: boolean;
  schools? : Array<NowSchool>;
  numberOfQuestions?: number;
  numberOfArticles?: number;
  localeId?: number | null;
}

export class TeachingPath {

  protected readonly _id: number;
  @observable protected _title: string;
  @observable protected _author: string | undefined;
  @observable protected _authorAvatar: string | undefined;
  @observable protected _description: string;
  @observable protected _guidance: string;
  @observable protected _hasGuidance: boolean = false;
  @observable protected _rootNodeId: number | undefined;
  @observable protected _lastSelectedNodeId: number | undefined;
  @observable protected _isPrivate: boolean = false;
  @observable protected _createdAt: string = '';
  @observable protected _isMySchool?: boolean = false;
  @observable protected _mySchools?: string | undefined = '';
  @observable protected _isFinished: boolean = false;
  @observable protected _content: TeachingPathNode | null = null;
  protected readonly _maxNumberOfSteps: number | undefined;
  protected readonly _minNumberOfSteps: number | undefined;
  protected readonly _ownedByMe: boolean;
  @observable protected _grades: Array<Grade> = [];
  @observable protected _keywords: Array<string> = [];

  @observable protected _sourceItems: Array<GenericGrepItem> = [];
  @observable protected _coreElementItems: Array<GenericGrepItem> = [];
  @observable protected _multiSubjectItems: Array<GenericGrepItem> = [];
  @observable protected _goalsItems: Array<GenericGrepItem> = [];
  @observable protected _subjectItems: Array<Subject> = [];

  @observable protected _subjects: Array<Subject> = [];
  @observable protected _sources: Array<number> = [];
  @observable protected _levels: Array<number>;
  @observable protected _view: string;
  @observable protected _featuredImage?: string;
  @observable protected _backgroundImage?: string;
  @observable protected _url?: string;
  @observable protected _answerId?: number;
  @observable protected _isPassed?: boolean | null;
  @observable protected _mark?: number | null;
  @observable protected _status?: boolean | null;
  @observable protected _comment?: string;
  @observable protected _isChanged?: boolean = false;
  @observable protected _isEvaluated?: boolean = false;
  @observable protected _isSelected?: boolean = false;
  @observable protected _isCreatedByContentManager: boolean = false;
  @observable protected _isAnswered: boolean = false;
  protected readonly _deadline: Date | undefined;
  @observable protected _isPublished?: boolean;
  @observable protected _isDistributed?: boolean;
  @observable protected _isCopy?: boolean;
  @observable protected _grepCoreElementsIds?: Array<number>;
  @observable protected _grepMainTopicsIds?: Array<number>;
  @observable protected _grepReadingInSubjectsIds?: Array<number>;
  @observable protected _grepGoalsIds?: Array<number>;
  @observable protected _grepGoals?: Array<GreepElements> = [];
  @observable protected _open?: boolean = false;
  @observable protected _schools?: Array<NowSchool> = [];
  protected readonly _numberOfQuestions?: number = 0;
  protected readonly _numberOfArticles?: number = 0;
  @observable protected _localeId?: number | null;

  constructor(args: TeachingPathArgs) {
    this._id = args.id;
    this._title = args.title;
    this._author = args.author || undefined;
    this._authorAvatar = args.authorAvatar || undefined;
    this._createdAt = args.createdAt || '';
    this._rootNodeId = args.rootNodeId || undefined;
    this._lastSelectedNodeId = args.lastSelectedNodeId || undefined;
    this._description = args.description || '';
    this._guidance = args.guidance || '';
    this._hasGuidance = args.hasGuidance || false;
    this._isPrivate = !isNil(args.isPrivate) ? args.isPrivate : true;
    this._isMySchool = args.isMySchool || false;
    this._mySchools = args.mySchools;
    this._isFinished = args.isFinished || false;
    this._content = args.content ? new TeachingPathNode(args.content) : null;
    this._minNumberOfSteps = args.minNumberOfSteps;
    this._maxNumberOfSteps = args.maxNumberOfSteps;
    this._grades = args.grades || [];
    this._keywords = args.keywords || [];

    this._sourceItems = args.sourceItems || [];
    this._coreElementItems = args.coreElementItems || [];
    this._multiSubjectItems = args.multiSubjectItems || [];
    this._goalsItems = args.goalsItems || [];
    this._subjectItems = args.subjects || [];

    this._subjects = args.subjects || [];
    this._sources = args.sources || [];
    this._view = args.view || 'edit';
    this._levels = args.levels || [secondLevel];
    this._featuredImage = args.featuredImage;
    this._backgroundImage = args.backgroundImage;
    this._url = args.url;
    this._answerId = args.answerId;
    this._comment = args.comment;
    this._mark = args.mark;
    this._isPassed = args.isPassed;
    this._status = args.status;
    this._isChanged = args.isChanged;
    this._levels = args.levels || [secondLevel];
    this._isEvaluated = args.isEvaluated;
    this._isSelected = args.isSelected;
    this._isCreatedByContentManager = !!args.isCreatedByContentManager;
    this._deadline = args.deadline;
    this._isAnswered = args.isAnswered || false;
    this._isPublished = args.isPublished;
    this._isDistributed = args.isDistributed;
    this._ownedByMe = typeof args.ownedByMe === 'boolean' ? args.ownedByMe : false;
    this._answerId = args.answerId;
    this._isCopy = args.isCopy || false;
    this._grepCoreElementsIds = args.grepCoreElementsIds;
    this._grepMainTopicsIds = args.grepMainTopicsIds;
    this._grepReadingInSubjectsIds = args.grepReadingInSubjectsIds;
    this._grepGoalsIds = args.grepGoalsIds;
    this._grepGoals = args.grepGoals || [];
    this._open = args.open || false;
    this._schools = args.schools || [];
    this._numberOfQuestions = args.numberOfQuestions || 0;
    this._numberOfArticles = args.numberOfArticles || 0;
    this._localeId = args.localeId;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get grepCoreElementsIds() {
    return this._grepCoreElementsIds;
  }

  @computed
  public get grepMainTopicsIds() {
    return this._grepMainTopicsIds;
  }

  @computed
  public get grepReadingInSubjectsIds() {
    return this._grepReadingInSubjectsIds;
  }

  @computed
  public get grepGoalsIds() {
    return this._grepGoalsIds;
  }

  @computed
  public get open() {
    return this._open;
  }

  @computed
  public get numberOfArticles() {
    return this._numberOfArticles;
  }

  @computed
  public get numberOfQuestions() {
    return this._numberOfQuestions;
  }

  @computed
  public get author() {
    return this._author;
  }

  @computed
  public get authorAvatar() {
    return this._authorAvatar;
  }

  @computed
  public get createdAt() {
    return this._createdAt;
  }

  @computed
  public get featuredImage() {
    return this._featuredImage;
  }

  @computed
  public get backgroundImage() {
    return this._backgroundImage;
  }

  @computed
  public get url() {
    return this._url;
  }

  @computed
  public get isPublished() {
    return this._isPublished;
  }

  @computed
  public get isDistributed() {
    return this._isDistributed;
  }

  @computed
  public get title() {
    return this._title;
  }

  @computed
  public get description() {
    return this._description;
  }

  @computed
  public get guidance() {
    return this._guidance;
  }

  @computed
  public get hasGuidance() {
    return this._hasGuidance;
  }

  @computed
  public get numberOfSteps() {
    return {
      min: this._minNumberOfSteps,
      max: this._maxNumberOfSteps
    };
  }

  @computed
  public get isPrivate() {
    return this._isPrivate;
  }

  @computed
  public get mySchools() {
    return this._mySchools;
  }

  @computed
  public get schools() {
    return this._schools;
  }

  @computed
  public get isMySchool() {
    return this._isMySchool;
  }

  @computed
  public get isFinished() {
    return this._isFinished;
  }

  @computed
  public get content() {
    return this._content;
  }

  @computed
  public get rootNodeId() {
    return this._rootNodeId;
  }

  @computed
  public get lastSelectedNodeId() {
    return this._lastSelectedNodeId;
  }

  @computed
  public get ownedByMe() {
    return this._ownedByMe;
  }

  @computed
  public get grades() {
    return this._grades;
  }

  @computed
  public get sourceItems() {
    return this._sourceItems;
  }

  @computed
  public get coreElementItems() {
    return this._coreElementItems;
  }

  @computed
  public get multiSubjectItems() {
    return this._multiSubjectItems;
  }

  @computed
  public get goalsItems() {
    return this._goalsItems;
  }

  @computed
  public get subjectItems() {
    return this._subjectItems;
  }

  @computed
  public get subjects() {
    return this._subjects;
  }

  @computed
  public get sources() {
    return this._sources;
  }

  @computed
  public get keywords() {
    return this._keywords;
  }

  @computed
  public get view() {
    return this._view;
  }

  @computed
  public get localeId() {
    return this._localeId;
  }

  public getListOfSubjects() {
    return toJS(this._subjects);
  }

  public getListOfSources() {
    return toJS(this._sources);
  }

  public getListOfKeywords() {
    return toJS(this._keywords);
  }

  public getListOfGrades() {
    return toJS(this._grades);
  }

  public getListOfGoals() {
    return toJS(this._grepGoals);
  }

  public getListOfgrepCoreElementsIds() {
    return this._grepCoreElementsIds;
  }

  public getListOfgrepGoalsIds() {
    return this._grepGoalsIds;
  }

  public setListgrepGoalsIds(data: Array<number>): void {
    this._grepGoalsIds = data;
  }

  public getListOfgrepMainTopicsIds() {
    return this._grepMainTopicsIds;
  }

  public getListOfgrepReadingInSubjectId() {
    return this._grepReadingInSubjectsIds;
  }

  public isOwnedByMe(): boolean {
    return this._ownedByMe;
  }

  @computed
  public get levels() {
    return this._levels;
  }

  @computed
  public get answerId() {
    return this._answerId;
  }

  @computed
  public get isPassed() {
    return this._isPassed;
  }

  @computed
  public get mark() {
    return this._mark;
  }

  @computed
  public get status() {
    return this._status;
  }

  @computed
  public get comment() {
    return this._comment;
  }

  @computed
  public get deadline() {
    return this._deadline;
  }

  @computed
  public get isAnswered() {
    return this._isAnswered;
  }

  @computed
  public get isCopy() {
    return this._isCopy;
  }
}

export class TeachingPathsList {

  private teachingPathService: TeachingPathService = injector.get<TeachingPathService>(TEACHING_PATH_SERVICE);
  public filter: Filter = new Filter();

  public setFiltersPerPage = (perPage: number) => {
    this.filter.per_page = perPage;
  }

  public setFilterSchoolTeachingPath = (school: number) => {
    this.filter.showMySchoolTeachingpath = school;
  }

  public async getAllTeachingPathsList() {
    return this.teachingPathService.getAllTeachingPathsList(this.filter);
  }

  public async getMyTeachingPathsList() {
    return this.teachingPathService.getMyTeachingPathsList(this.filter);
  }

  public async getMySchoolTeachingPathsList() {
    return this.teachingPathService.getMySchoolTeachingPathsList(this.filter);
  }

  public async getStudentTeachingPathsList() {
    return this.teachingPathService.getStudentTeachingPathsList(this.filter);
  }

  public async getTeachingPathDistributes(filter: Filter) {
    return this.teachingPathService.getTeachingPathDistributes(filter);
  }

  public async getTeachingPathListOfStudentInList(studentId: number) {
    return this.teachingPathService.getTeachingPathListOfStudentInList(studentId, this.filter);
  }

  public async getTeachingPathDataById(id: number): Promise<TeachingPath> {
    return this.teachingPathService.getTeachingPathDataById(id);
  }

  public async getTeachingPathById(id: number) {
    return this.teachingPathService.getTeachingPathById(id);
  }

  public async copyTeachingPath(id: number) {
    return this.teachingPathService.copyTeachingPath(id);
  }

  public setFiltersPage(number: number) {
    this.filter.page = number;
  }

  public setFiltersIsAnswered(status: string | null) {
    this.filter.isAnswered = status;
  }

  public setFiltersIsEvaluated(status: string | null) {
    this.filter.isEvaluated = status;
  }

  public setFiltersSorting(orderField: string, order: string) {
    this.filter.order = order;
    this.filter.orderField = orderField;
  }

  public setFiltersSubjectID(id: number | null) {
    this.filter.subject = id;
  }

  public setFiltersGradeID(id: number | null) {
    this.filter.grade = id;
  }

  public setFiltersSearchQuery(searchQuery: string) {
    this.filter.searchQuery = searchQuery;
  }

  public setFilterSorting(orderField: string, order: string) {
    this.filter.orderField = orderField;
    this.filter.order = order;
  }
}
