import { action, computed, observable, toJS } from 'mobx';

import { injector } from 'Injector';
import { ASSIGNMENT_SERVICE, AssignmentService } from 'assignment/service';
import { ContentBlock } from './ContentBlock';

import { secondLevel } from 'utils/constants';
import { StoreState, Locales } from 'utils/enums';
import moment, { Moment } from 'moment';

import { AssignmentDistributeDTO } from './factory';
import { isNil } from 'lodash';
import { CustomImage } from './view/NewAssignment/AttachmentsList/CustomImageForm/CustomImageForm';
import { createContext } from 'vm';
import { CustomImgAttachmentResponse, ResponseFetchCustomImages } from './api';
import { url } from 'inspector';

export const ASSIGNMENT_REPO = 'ASSIGNMENT_REPO';

export const ARTICLE_REPO_KEY = 'ARTICLE_REPO_KEY';
export const ARTICLE_SERVICE_KEY = 'ARTICLE_SERVICE_KEY';

export interface AssignmentRepo {
  getGrades(): Promise<Array<Grade>>;
  getSubjects(): Promise<Array<Subject>>;
  getSources(): Promise<Array<Source>>;
  getAssignmentById(id: number): Promise<Assignment>;
  getMyAssignmentsList(filter: Filter): Promise<{
    myAssignments: Array<Assignment>;
    total_pages: number;
  }>;
  getAllAssignmentsList(filter: Filter): Promise<{
    myAssignments: Array<Assignment>;
    total_pages: number;
  }>;
  getAllSchoolAssignmentsList(filter: Filter): Promise<{
    myAssignments: Array<Assignment>;
    total_pages: number;
  }>;
  getInReviewAssignmentsList(filter: Filter): Promise<{
    myAssignments: Array<Assignment>;
    total_pages: number;
  }>;
  getStudentAssignmentList(filter: Filter): Promise<{
    myAssignments: Array<Assignment>;
    total_pages: number;
  }>;
  removeAssignment(assignmentId: number): Promise<void>;
  getAssignmentListOfStudentInList(
    studentId: number,
    filter: Filter
  ): Promise<{
    myAssignments: Array<Assignment>;
    total_pages: number;
  }>;
  getAssignmentDistributes(filter: Filter): Promise<{
    distributes: Array<AssignmentDistribute>;
    total_pages: number;
  }>;
  copyAssignment(id: number, all?: boolean): Promise<number>;
  copyAssignmentByLocale(id: number, localeid?:number, all?: boolean): Promise<number>;
  getGrepFiltersAssignment(locale: string, grades: string, subjects: string, coreElements?: string, $goals?: string): Promise<FilterGrep>;
  getGrepFiltersMyAssignment(locale: string, grades: string, subjects: string, coreElements?: string, $goals?: string): Promise<FilterGrep>;
  getGrepFiltersMySchoolAssignment(locale: string, grades: string, subjects: string, coreElements?: string, $goals?: string): Promise<FilterGrep>;
  downloadTeacherGuidancePDF(id: number): Promise<void>;
  deleteAssignmentTranslation(assignmentId: number, localeId: number): Promise<void>;
  getLocalesByApi(): Promise<Array<LenguajesB>>;
}

export enum QuestionType {
  Text = 'TEXT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  TeachingPath = 'TEACHING_PATH',
  ImageChoice = 'IMAGE_CHOICE',
}

export class Language {
  @observable public langId: string;
  @observable public description: string;
  @observable public slug: string;
  @observable public langOrder: number;

  constructor(langId: string, description: string, slug: string, langOrder: number) {
    this.langId = langId;
    this.description = description;
    this.slug = slug;
    this.langOrder = langOrder;
  }
}

export class Translations {
  @observable public id: number;
  @observable public value: boolean;

  constructor(id: number, value: boolean) {
    this.id = id;
    this.value = value;
  }
}

export class LenguajesB {
  @observable public id: number;
  @observable public code: string;
  @observable public name: string;

  constructor(id: number, code: string, name: string) {
    this.id = id;
    this.code = code;
    this.name = name;
  }
}

export class LenguajesC {
  @observable public id: number;
  @observable public code: string;
  @observable public name: string;

  constructor(id: number, code: string, name: string) {
    this.id = id;
    this.code = code;
    this.name = name;
  }
}

export class Grade {
  @observable public id: number;
  @observable public title: string;
  @observable public filterStatus?: string | undefined | null;
  // tslint:disable-next-line: variable-name
  @observable public grade_parent?: Array<number | string>;
  // tslint:disable-next-line: variable-name
  @observable public name_sub?: string | null;
  @observable public managementId?: number | null;

  constructor(id: number, title: string, managementId?: number | undefined | null) {
    this.id = id;
    this.title = title;
    this.filterStatus = null;
    // tslint:disable-next-line: variable-name
    this.grade_parent = [];
    // tslint:disable-next-line: variable-name
    this.name_sub = null;
    this.managementId = managementId;
  }
}

export class GenericGrepItem {
  @observable public id: number;
  @observable public description: string;
  @observable public gradeDesc?: string | undefined | null;
  @observable public subjectId?: number | undefined | null;
  @observable public subjectDesc?: string | undefined | null;

  constructor(id: number, description: string, gradeDesc?: string, subjectId?: number, subjectDesc?: string) {
    this.id = id;
    this.description = description;
    if (gradeDesc) {
      this.gradeDesc = gradeDesc;
    }
    if (subjectId) {
      this.subjectId = subjectId;
    }
    if (subjectDesc) {
      this.gradeDesc = subjectDesc;
    }
  }
}

export class EducationalGoalItem {
  @observable public id: number;
  @observable public description: string;
  @observable public gradeDesc: string | undefined | null;

  constructor(id: number, description: string, gradeDesc: string) {
    this.id = id;
    this.description = description;
    this.gradeDesc = gradeDesc;
  }
}

export class SourceItem {
  @observable public id: number;
  @observable public description: string;

  constructor(id: number, description: string) {
    this.id = id;
    this.description = description;
  }
}

export class CoreElementItem {
  @observable public id: number;
  @observable public code: string;
  @observable public description: string;

  constructor(id: number, code: string, description: string) {
    this.id = id;
    this.code = code;
    this.description = description;
  }
}

export class NowSchool {
  @observable public id: number;
  @observable public name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class Subject {
  @observable public id: number;
  @observable public title: string;
  @observable public description?: string | undefined | null;
  @observable public filterStatus?: string | undefined | null;
  @observable public managementId?: number | undefined | null;

  constructor(id: number, title: string, description?: string | undefined | null, managementId?: number | undefined | null) {
    this.id = id;
    this.title = title;
    this.description = description!;
    this.filterStatus = null;
    this.managementId = managementId;
  }
}

export interface DefDto {
  id: number;
  description: string;
}

export interface GoalsDto {
  id: number;
  gradeDesc: string;
  description: string;
}

export class Source {
  @observable public id: number;
  @observable public title: string;
  @observable public default: boolean;

  constructor(id: number, title: string, defaults: boolean) {
    this.id = id;
    this.title = title;
    this.default = defaults;
  }
}

export class Keyword {
  @observable public description: string;

  constructor(description: string) {
    this.description = description;
  }
}

export class GreepSelectValue {
  @observable public value: number | string | null;
  @observable public label: string;

  constructor(value: number, label: string) {
    this.value = value;
    this.label = label;
  }
}

export class Greep {
  @observable public id: number;
  @observable public title: string;
  @observable public alt?: string;

  constructor(id: number, title: string, alt: string = '') {
    this.id = id;
    this.title = title;
    this.alt = alt;
  }
}

export interface GreepElementsFromBackend {
  kode: string;
  description: string;
}

export interface GrepFilters {
  id: number;
  name: string;
  // tslint:disable-next-line: variable-name
  wp_id: number;
  filterStatus?: any;
  // tslint:disable-next-line: variable-name
  grade_parent?: Array<number | string>;
  // tslint:disable-next-line: variable-name
  name_sub?: string | null;
}

export interface GrepElementFilters {
  id: number;
  description: string;
  code: string;
}

export interface GrepReading {
  id: number;
  name: string;
  // tslint:disable-next-line: variable-name
  locale_id: number;
}

export interface GrepSource {
  id: number;
  name: string;
  // tslint:disable-next-line: variable-name
  wp_id: number;
}

export class FilterGrep {
  public localeFilters?: Array<GrepFilters>;
  public subjectFilters?: Array<GrepFilters>;
  public gradeFilters?: Array<GrepFilters>;
  public coreElementsFilters?: Array<GrepElementFilters>;
  public mainTopicFilters?: Array<GrepElementFilters>;
  public readingInSubjects?: Array<GrepReading>;
  public sourceFilters?: Array<GrepSource>;
  public goalFilters?: Array<GrepElementFilters>;
}

export class GoalsData {
  public id?: number;
  public code?: string;
  public description?: string;
  public coreElements?: Array<GrepElementFilters>;
  public grades?: Array<GrepFilters>;
  public subject?: GrepFilters;
}

export interface AssignmentArgs {
  id: number;
  title?: string;
  author?: string;
  authoravatar?: string;
  authorRole?: string;
  description?: string;
  guidance?: string;
  hasGuidance?: boolean;
  questions?: Array<Question>;
  grades?: Array<Grade>;
  subjects?: Array<Subject>;
  sources?: Array<number>;
  keywords?: Array<string>;

  subjectItems?: Array<any>;
  sourceItems?: Array<any>;
  coreElementItems?: Array<any>;
  multiSubjectItems?: Array<any>;
  goalsItems?: Array<any>;

  isPrivate?: boolean;
  isMySchool?: boolean;
  inReview?: boolean;
  mySchools?: string | undefined;
  relatedArticles?: Array<Article>;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  numberOfQuestions?: number;
  isAnswered?: boolean;
  view?: string;
  deadline?: Date;
  featuredImage?: string;
  backgroundImage?: string;
  answerId?: number;
  isPassed?: boolean | null;
  mark?: number | null;
  status?: boolean | null;
  comment?: string;
  isChanged?: boolean;
  levels?: Array<number>;
  isEvaluated?: boolean;
  isSelected?: boolean;
  isCreatedByContentManager?: boolean;
  isPublished?: boolean;
  isDistributed?: boolean;
  ownedByMe?: boolean;
  isCopy?: boolean;
  grepCoreelements?: Array<GreepElementsFromBackend>;
  grepMaintopic?: Array<GreepElementsFromBackend>;
  grepReadingInsubject?: string;
  grepCoreElementsIds?: Array<number>;
  grepMainTopicsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  grepReadingInSubjectsIds?: Array<number>;
  grepGoals?: Array<GreepElements>;
  open?: boolean;
  schools?: Array<NowSchool>;
  localeId?: number | null;
  canEditOrDelete?: boolean;
  isTranslations?: boolean;
  translations?: Array<Translations>;
  originalLocaleId?: number;
  // tslint:disable-next-line: variable-name
  locale_id?: number;
}

export class Assignment {
  protected readonly _id: number;
  protected readonly _deadline: Date | undefined;
  protected readonly _ownedByMe: boolean;
  @observable protected _title: string = '';
  @observable private _author: string = '';
  @observable protected _authoravatar: string = '';
  @observable protected _authorRole: string | undefined;
  @observable protected _questions: Array<Question> = [];
  @observable protected _description: string = '';
  @observable protected _guidance: string;
  @observable protected _hasGuidance: boolean = false;
  @observable protected _grades: Array<Grade> = [];
  @observable protected _subjects: Array<Subject> = [];
  @observable protected _sources: Array<number> = [];
  @observable protected _keywords: Array<string> = [];
  @observable protected _isPrivate: boolean = false;

  @observable protected _sourceItems: Array<GenericGrepItem> = [];
  @observable protected _coreElementItems: Array<GenericGrepItem> = [];
  @observable protected _multiSubjectItems: Array<GenericGrepItem> = [];
  @observable protected _goalsItems: Array<GenericGrepItem> = [];
  @observable protected _subjectItems: Array<Subject> = [];

  @observable protected _isMySchool: boolean = false;
  @observable protected _inReview: boolean = false;
  @observable protected _mySchools: string | undefined = '';
  @observable protected _relatedArticles: Array<Article> = [];
  @observable protected _createdAt: string = '';
  @observable protected _updatedAt: string = '';
  @observable protected _publishedAt: string = '';
  @observable protected _numberOfQuestions: number = 0;
  @observable protected _isSomeMultipleChoiceOptionEmpty: boolean = false;
  @observable protected _isAnswered: boolean = false;
  @observable protected _levels: Array<number>;
  @observable protected _view: string | undefined;
  @observable protected _featuredImage?: string;
  @observable protected _backgroundImage?: string;
  @observable protected _answerId?: number;
  @observable protected _isPassed?: boolean | null;
  @observable protected _mark?: number | null;
  @observable protected _status?: boolean | null;
  @observable protected _comment?: string;
  @observable protected _isChanged?: boolean = false;
  @observable protected _isEvaluated?: boolean = false;
  @observable protected _isSelected?: boolean = false;
  @observable protected _isCreatedByContentManager: boolean = false;
  @observable protected _isPublished?: boolean;
  @observable protected _isDistributed?: boolean;
  @observable protected _isCopy?: boolean;
  public grepCoreelements?: Array<GreepElementsFromBackend>;
  public grepMaintopic?: Array<GreepElementsFromBackend>;
  public grepReadingInsubject?: string;
  public grepGoals?: Array<GreepElements>;
  public grepCoreElementsIds?: Array<number>;
  public grepMainTopicsIds?: Array<number>;
  public grepGoalsIds?: Array<number>;
  public grepReadingInSubjectsIds?: Array<number>;
  public _open?: boolean;
  public _schools?: Array<NowSchool>;
  @observable protected _localeId?: number | null;
  @observable protected _canEditOrDelete?: boolean;
  @observable protected _isTranslations?: boolean;
  @observable protected _translations?: Array<Translations>;
  @observable protected _originalLocaleId?: number = 0;
  // tslint:disable-next-line: variable-name
  @observable protected _locale_id?: number = 0;

  constructor(args: AssignmentArgs) {
    this._id = args.id;
    this._title = args.title || '';
    this._author = args.author || '';
    this._authorRole = args.authorRole || undefined;
    this._authoravatar = args.authoravatar || '';
    this._description = args.description || '';
    this._guidance = args.guidance || '';
    this._hasGuidance = args.hasGuidance || false;
    this._questions = args.questions || [];
    this._grades = args.grades || [];
    this._subjects = args.subjects || [];
    this._sources = args.sources || [];
    this._keywords = args.keywords || [];

    this._sourceItems = args.sourceItems || [];
    this._coreElementItems = args.coreElementItems || [];
    this._multiSubjectItems = args.multiSubjectItems || [];
    this._goalsItems = args.goalsItems || [];
    this._subjectItems = args.subjects || [];

    this._isPrivate = !isNil(args.isPrivate) ? args.isPrivate : true;
    this._mySchools = args.mySchools;
    this._inReview = args.inReview || false;
    this._isMySchool = args.isMySchool || false;
    this._relatedArticles = args.relatedArticles || [];
    this._createdAt = args.createdAt || '';
    this._updatedAt = args.updatedAt || '';
    this._publishedAt = args.publishedAt || '';
    this._numberOfQuestions = args.numberOfQuestions || this._questions.length;
    this._isAnswered = args.isAnswered || false;
    this._view = args.view || 'edit';
    this._deadline = args.deadline;
    this._featuredImage = args.featuredImage;
    this._backgroundImage = args.backgroundImage;
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
    this._isPublished = args.isPublished;
    this._isDistributed = args.isDistributed;
    this._ownedByMe =
      typeof args.ownedByMe === 'boolean' ? args.ownedByMe : false;
    this._isCopy = args.isCopy || false;
    this.grepCoreelements = args.grepCoreelements;
    this.grepGoals = args.grepGoals;
    this.grepMaintopic = args.grepMaintopic;
    this.grepReadingInsubject = args.grepReadingInsubject;
    this.grepCoreElementsIds = args.grepCoreElementsIds;
    this.grepMainTopicsIds = args.grepMainTopicsIds;
    this.grepGoalsIds = args.grepGoalsIds;
    this.grepReadingInSubjectsIds = args.grepReadingInSubjectsIds;
    this._open = args.open || false;
    this._schools = args.schools || [];
    this._localeId = args.localeId;
    this._canEditOrDelete = args.canEditOrDelete;
    this._translations = args.translations;
    this._isTranslations = args.isTranslations;
    this._originalLocaleId = args.originalLocaleId;
    // tslint:disable-next-line: variable-name
    this._locale_id = args.locale_id;
  }

  public isOwnedByMe(): boolean {
    return this._ownedByMe;
  }

  @computed
  public get author(): string {
    return this._author;
  }

  @computed
  public get authorRole() {
    return this._authorRole;
  }

  @computed
  public get answerId() {
    return this._answerId;
  }

  @computed
  public get isSelected() {
    return this._isSelected;
  }

  @computed
  public get isDistributed() {
    return this._isDistributed;
  }

  @computed
  public get isPublished() {
    return this._isPublished;
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
  public get open() {
    return this._open;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get title() {
    return this._title;
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
  public get questions() {
    return this._questions;
  }

  @computed
  public get grades() {
    return this._grades;
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
  public get isPrivate() {
    return this._isPrivate;
  }

  @computed
  public get ownedByMe() {
    return this._ownedByMe;
  }

  public get isMySchool() {
    return this._isMySchool;
  }

  public get inReview() {
    return this._inReview;
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
  public get relatedArticles() {
    return this._relatedArticles;
  }

  @computed
  public get createdAt() {
    return this._createdAt;
  }

  @computed
  public get updatedAt() {
    return this._updatedAt;
  }

  @computed
  public get publishedAt() {
    return this._publishedAt;
  }

  @computed
  public get numberOfQuestions() {
    return this._numberOfQuestions;
  }

  @computed
  public get isAnswered() {
    return this._isAnswered;
  }

  @computed
  public get levels() {
    return this._levels;
  }

  @computed
  public get view() {
    return this._view;
  }

  @computed
  public get canEditOrDelete() {
    return this._canEditOrDelete;
  }

  @computed
  public get translations() {
    return this._translations;
  }

  @computed
  public get isTranslations() {
    return this._isTranslations;
  }

  @computed
  public get originalLocaleId() {
    return this._originalLocaleId;
  }

  @computed
  public get deadline() {
    return this._deadline;
  }

  @computed
  public get isChanged() {
    return this._isChanged;
  }

  @computed
  public get isEvaluated() {
    return this._isEvaluated;
  }

  @computed
  public get isCreatedByContentManager() {
    return this._isCreatedByContentManager;
  }

  @computed
  public get isCopy() {
    return this._isCopy;
  }

  @computed
  public get localeId() {
    return this._localeId;
  }

  @computed
  // tslint:disable-next-line: variable-name
  public get locale_id() {
    // tslint:disable-next-line: variable-name
    return this._locale_id;
  }

  @computed
  public get authoravatar() {
    return this._authoravatar;
  }

  public getListOfArticles() {
    return toJS(this._relatedArticles);
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
    return toJS(this.grepGoals);
  }
}

export class QuestionAttachment {
  public readonly id: number;
  public readonly path: string;
  public readonly alt: string;
  public readonly title: string;
  public readonly fileName: string;
  public readonly source?: string | undefined | null;
  public readonly src?: Array<string> | undefined | null;
  public readonly duration?: number;
  public readonly deleteddate?: string | undefined | null;

  constructor(params: {
    id: number;
    path: string;
    alt: string;
    title: string;
    fileName: string;
    duration: number;
    source: string | undefined | null;
    src: Array<string> | undefined | null;
    deleteddate?: string | undefined | null;
  }) {
    this.id = params.id;
    this.path = params.path;
    this.alt = params.alt;
    this.title = params.title;
    this.source = params.source;
    this.src = params.src;
    this.fileName = params.fileName;
    this.duration = params.duration;
    this.deleteddate = params.deleteddate;
  }
}

export interface QuestionParams {
  id?: number;
  title: string;
  guidance?: string;
  order: number;
  hide_answer?: boolean;
  contentBlocks: Array<ContentBlock>;
}

export abstract class Question {
  private readonly _id?: number;
  private readonly _type: QuestionType;
  @observable protected _title: string;
  @observable protected _source?: string;
  @observable protected _guidance: string;
  // tslint:disable-next-line: variable-name
  @observable protected _hide_answer?: boolean | undefined;
  @observable protected _order: number;
  @observable protected _content: Array<ContentBlock> = [];

  protected constructor(params: QuestionParams & { type: QuestionType }) {
    this._id = params.id;
    this._type = params.type;
    this._title = params.title;
    this._guidance = params.guidance || '';
    this._order = params.order;
    this._content = params.contentBlocks;
    // tslint:disable-next-line: variable-name
    this._hide_answer = params.hide_answer || false;
  }

  @computed
  public get content() {
    return this._content;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get type(): QuestionType {
    return this._type;
  }

  @computed
  public get title() {
    return this._title;
  }

  @computed
  public get source() {
    return this._source;
  }

  @computed
  public get guidance() {
    return this._guidance;
  }

  @computed
  public get hide_answer() {
    return this._hide_answer;
  }

  @computed
  public get orderPosition() {
    return this._order;
  }
}

export type TypedQuestion = TextQuestion &
  MultipleChoiceQuestion &
  ImageChoiceQuestion;

export class TextQuestion extends Question {
  constructor(params: QuestionParams) {
    super({ ...params, type: QuestionType.Text });
  }
}

export class MultipleChoiceQuestionOption {
  @observable protected _title: string;
  @observable protected _isRight: boolean;

  constructor(title: string, isRight: boolean) {
    this._title = title;
    this._isRight = isRight;
  }

  @computed
  public get title() {
    return this._title;
  }

  @computed
  public get isRight() {
    return this._isRight;
  }
}

export interface MultipleChoiceQuestionArgs extends QuestionParams {
  options: Array<MultipleChoiceQuestionOption>;
}

export class MultipleChoiceQuestion extends Question {
  protected _options: Array<MultipleChoiceQuestionOption>;

  constructor(params: MultipleChoiceQuestionArgs) {
    super({ ...params, type: QuestionType.MultipleChoice });
    this._options = params.options;
  }

  @computed
  public get options() {
    return this._options;
  }
}

export class ImageChoiceQuestionOption {
  @observable protected _title: string;
  @observable protected _image: QuestionAttachment | undefined;
  @observable protected _orderPosition: number;
  @observable protected _isRight: boolean;

  constructor(
    title: string,
    image: QuestionAttachment | undefined,
    orderPosition: number,
    isRight: boolean
  ) {
    this._title = title;
    this._image = image;
    this._orderPosition = orderPosition;
    this._isRight = isRight;
  }

  @computed
  public get title() {
    return this._title;
  }

  @computed
  public get image() {
    return this._image;
  }

  @computed
  public get order() {
    return this._orderPosition;
  }

  @computed
  public get isRight() {
    return this._isRight;
  }
}

export interface ImageChoiceQuestionArgs extends QuestionParams {
  options: Array<ImageChoiceQuestionOption>;
}

export class ImageChoiceQuestion extends Question {
  protected _options: Array<ImageChoiceQuestionOption>;

  constructor(params: ImageChoiceQuestionArgs) {
    super({ ...params, type: QuestionType.ImageChoice });
    this._options = params.options;
  }

  @computed
  public get options() {
    return this._options;
  }
}

export class Filter {
  @observable public page?: number | null;
  // tslint:disable-next-line: variable-name
  @observable public per_page?: number | null;
  @observable public isPublished?: number | null;
  @observable public order?: string | null;
  @observable public orderField?: string | null;
  @observable public locale?: string | number | null;
  @observable public grade?: string | number | null;
  @observable public subject?: string | number | null;
  @observable public isAnswered?: string | null;
  @observable public searchQuery?: string | null;
  @observable public isEvaluated?: string | null;
  @observable public isPassed?: number | null;
  @observable public isActive?: number | null;
  @observable public grepCoreElementsIds?: string | number | null;
  @observable public grepMainTopicsIds?: string | number | null;
  @observable public grepGoalsIds?: string | number | null;
  @observable public grepReadingInSubject?: string | number | null;
  @observable public source?: string | number | null;
  public showMyAssignments?: number | null;
  public showMySchoolTeachingpath?: number | null;
  public showMySchoolAssignments?: number | null;
  public onlyOwnSchools?: number | null;
  public articles?: string | null;
  public inReview?: boolean;
}

export interface LanguageFilter {
  langId: string;
  description: string;
  slug: string;
  langOrder: number;
}

export interface GradeFilter {
  // tslint:disable-next-line: variable-name
  grade_id: string;
  description: string;
  // tslint:disable-next-line: variable-name
  grade_parent: Array<string>;
  // tslint:disable-next-line: variable-name
  name_sub: string;
  // tslint:disable-next-line: variable-name
  term_order: string;
}

export interface SubjectFilter {
  // tslint:disable-next-line: variable-name
  subject_id: string;
  description: string;
  // tslint:disable-next-line: variable-name
  grade_ids: Array<string>;
}

export interface CoreFilter {
  // tslint:disable-next-line: variable-name
  core_element_id: string;
  description: string;
  // tslint:disable-next-line: variable-name
  grade_ids: Array<CoreFilterItemGrades>;
}

export interface CoreFilterItemGrades {
  // tslint:disable-next-line: variable-name
  grade_id: string;
  subject_ids: Array<string>;
}

export interface MultiFilter {
  // tslint:disable-next-line: variable-name
  main_topic_id: string;
  description: string;
  // tslint:disable-next-line: variable-name
  grade_ids: Array<MultiFilterItemGrades>;
}

export interface MultiFilterItemGrades {
  // tslint:disable-next-line: variable-name
  grade_id: string;
  subject_ids: Array<MultiFilterItemGradesItemSubjects>;
}

export interface MultiFilterItemGradesItemSubjects {
  // tslint:disable-next-line: variable-name
  subject_id: string;
  core_element_ids: Array<string>;
}

export interface GoalsFilter {
  // tslint:disable-next-line: variable-name
  goal_id: string;
  description: string;
  // tslint:disable-next-line: variable-name
  grade_ids: Array<GoalsFilterItemGrades>;
}

export interface GoalsFilterItemGrades {
  // tslint:disable-next-line: variable-name
  grade_id: string;
  // tslint:disable-next-line: variable-name
  subject_ids?: Array<GoalsFilterItemGradesItemSubjects>;
}

export interface GoalsFilterItemGradesItemSubjects {
  // tslint:disable-next-line: variable-name
  subject_id: string;
  // tslint:disable-next-line: variable-name
  core_element_ids: Array<GoalsFilterItemGradesItemSubjectsItemCoreElements>;
}

export interface GoalsFilterItemGradesItemSubjectsItemCoreElements {
  // tslint:disable-next-line: variable-name
  core_element_id: string;
  // tslint:disable-next-line: variable-name
  main_topic_ids: Array<string>;
}

export interface SourceFilter {
  // tslint:disable-next-line: variable-name
  term_id: string;
  // tslint:disable-next-line: variable-name
  description: string;
  // tslint:disable-next-line: variable-name
  slug: string;
  grade_ids: Array<SourceFilterItemGrades>;
}

export interface SourceFilterItemGrades {
  // tslint:disable-next-line: variable-name
  grade_id: string;
  // tslint:disable-next-line: variable-name
  subject_ids?: Array<SourceFilterItemGradesItemSubjects>;
}

export interface SourceFilterItemGradesItemSubjects {
  // tslint:disable-next-line: variable-name
  subject_id: string;
  // tslint:disable-next-line: variable-name
  core_element_ids: Array<SourceFilterItemGradesItemSubjectsItemCoreElements>;
}

export interface SourceFilterItemGradesItemSubjectsItemCoreElements {
  // tslint:disable-next-line: variable-name
  core_element_id: string;
  // tslint:disable-next-line: variable-name
  main_topic_ids: Array<SourceFilterItemGradesItemSubjectsItemCoreElementsItemMainTopics>;
}

export interface SourceFilterItemGradesItemSubjectsItemCoreElementsItemMainTopics {
  // tslint:disable-next-line: variable-name
  main_topic_id: string;
  // tslint:disable-next-line: variable-name
  goal_ids: Array<string>;
}

export class FilterArticlePanel {
  public LanguageFilter?: Array<LanguageFilter>;
  // tslint:disable-next-line: variable-name
  public grade_filter?: Array<GradeFilter>;
  // tslint:disable-next-line: variable-name
  public subject_filter?: Array<SubjectFilter>;
  // tslint:disable-next-line: variable-name
  public core_elements_filter?: Array<CoreFilter>;
  // tslint:disable-next-line: variable-name
  public multidisciplinay_filter?: Array<MultiFilter>;
  // tslint:disable-next-line: variable-name
  public goals_filter?: Array<GoalsFilter>;
  // tslint:disable-next-line: variable-name
  public source_filter?: Array<SourceFilter>;
}

export class AssignmentList {
  private assignmentService: AssignmentService =
    injector.get<AssignmentService>(ASSIGNMENT_SERVICE);

  public filter: Filter = new Filter();

  public setFiltersPage(number: number) {
    this.filter.page = number;
  }

  public setFilterSchoolAssignments(number: number) {
    this.filter.showMySchoolAssignments = number;
  }

  public setFilterInReviewAssignments(value: boolean) {
    this.filter.inReview = value;
  }

  @action
  public setFiltersPerPage(number: number) {
    this.filter.per_page = number;
  }

  public setFiltersIsPublished(number: number) {
    this.filter.isPublished = number;
  }

  public setFiltersSorting(orderField: string, order: string) {
    this.filter.order = order;
    this.filter.orderField = orderField;
  }

  public setFiltersLocale(locale: string | number | null) {
    this.filter.locale = locale;
  }

  public setFiltersGradeID(gradeID: string | number | null) {
    this.filter.grade = gradeID;
  }

  public setFiltersSubjectID(subjectID: string | number | null) {
    this.filter.subject = subjectID;
  }

  public setFiltersMultiID(multiID: string | number | null) {
    this.filter.grepMainTopicsIds = multiID;
  }

  public setFiltersCoreID(coreID: string | number | null) {
    this.filter.grepCoreElementsIds = coreID;
  }

  public setFiltersGoalID(goalID: string | number | null) {
    this.filter.grepGoalsIds = goalID;
  }

  public setFiltersReadingID(readingID: string | number | null) {
    this.filter.grepReadingInSubject = readingID;
  }

  public setFiltersIsEvaluated(status: string | null) {
    this.filter.isEvaluated = status;
  }

  public setFiltersIsAnswered(status: string | null) {
    this.filter.isAnswered = status;
  }

  public setFiltersSearchQuery(searchQuery: string) {
    this.filter.searchQuery = searchQuery;
  }

  public setFilterShowMyAssignments(status: number | null) {
    this.filter.showMyAssignments = status;
  }

  public async getAllAssignmentsList() {
    return this.assignmentService.getAllAssignmentsList(this.filter);
  }

  public async getAllSchoolAssignmentsList() {
    return this.assignmentService.getAllSchoolAssignmentsList(this.filter);
  }

  public async getInReviewAssignmentsList() {
    return this.assignmentService.getInReviewAssignmentsList(this.filter);
  }

  public async getMyAssignmentsList() {
    return this.assignmentService.getMyAssignmentsList(this.filter);
  }

  public async getStudentAssignmentList() {
    return this.assignmentService.getStudentAssignmentList(this.filter);
  }

  public async getAssignmentListOfStudentInList(studentId: number) {
    return this.assignmentService.getAssignmentListOfStudentInList(
      studentId,
      this.filter
    );
  }
}

export class AssignmentDistribute {
  public id: number;
  public title: string;
  public image: string | null;
  public questionsCount: number;
  public answeredDistributes: number;
  public totalDistributes: number;
  public deadline: Moment;
  public subjects: Array<Subject>;
  public grades: Array<Grade>;

  constructor(dto: AssignmentDistributeDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.image = dto.featuredImage;
    this.questionsCount = dto.numberOfQuestions;
    this.answeredDistributes = dto.answeredDistributes;
    this.totalDistributes = dto.totalDistributes;
    this.deadline = moment(dto.defaultEndDate);
    this.subjects = dto.subjects.map(
      subject => new Subject(subject.id, subject.title, subject.description)
    );
    this.grades = dto.grades.map(grade => new Grade(grade.id, grade.title));
  }
}

export class AssignmentDistributeList {
  private assignmentService: AssignmentService =
    injector.get<AssignmentService>(ASSIGNMENT_SERVICE);
  @observable private _distributes: Array<AssignmentDistribute> = [];
  @observable private _pages: number = 0;
  @observable private _state: StoreState = StoreState.PENDING;

  public get distributes(): Array<AssignmentDistribute> {
    return this._distributes;
  }

  public get pages(): number {
    return this._pages;
  }

  public get state(): StoreState {
    return this._state;
  }

  @action
  public async getAssignmentDistributes(filter: Filter): Promise<void> {
    this._distributes = new Array(filter.per_page!).fill(1);
    this._state = StoreState.LOADING;

    try {
      const { distributes, total_pages } =
        await this.assignmentService.getAssignmentDistributes(filter);

      this._distributes = distributes;
      this._pages = total_pages;
      this._state = StoreState.PENDING;
    } catch (e) {
      this._distributes = [];
      this._state = StoreState.ERROR;
    }
  }
}

export interface ArticleRepo {
  getArticles(params?: {
    page: number;
    perPage: number;
    order?: string;
    grades?: number;
    subjects?: number;
    core?: number | string;
    goal?: number | string;
    multi?: number;
    source?: number;
    searchTitle?: string;
  }): Promise<Array<Article>>;
  getArticlesByIds(ids: Array<number | false>): Promise<Array<Article>>;
  fetchVideos(postIds: Array<number>): Promise<Array<Attachment>>;
  fetchImages(postIds: Array<number>): Promise<Array<Attachment>>;
  fetchCoverImages(postIds: Array<number>): Promise<Array<Attachment>>;
  fetchCustomImages(ids: string, page: number, title: string): Promise<ResponseFetchCustomImages>;
  createCustomImage(fd: FormData): Promise<CustomImgAttachmentResponse>;
  deleteCustomImage(imageId: number): Promise<any>;
  updateCustomImage(customImageId: number, formData: FormData): Promise<any>;
  increaseUse(imageId: number): Promise<any>;
  decreaseUse(imageId: number): Promise<any>;
  getLocaleData(locale: Locales): Promise<Array<WPLocale>>;
}

export interface WPLocale {
  id: string;
  slug: string;
  name: string;
}

export class Attachment {
  public readonly id: number;
  public readonly path: string;
  public readonly alt: string;
  public readonly fileName: string;
  public readonly title: string;
  // tslint:disable-next-line
  public readonly url_large?: string;
  public readonly duration?: number;
  public readonly src?: Array<string> | undefined | null;
  public readonly source?: string | undefined | null;

  constructor(
    id: number,
    path: string,
    alt: string,
    fileName: string,
    title: string,
    // tslint:disable-next-line
    url_large?: string,
    duration?: number,
    src?: Array<string> | undefined | null,
    source?: string,
  ) {
    this.id = id;
    this.path = path;
    this.alt = alt;
    this.fileName = fileName;
    this.title = title;
    this.duration = duration;
    this.src = src;
    this.source = source;
    this.url_large = url_large;
  }
}

export class CustomImgAttachment {
  public readonly id: number;
  public readonly path: string;
  public readonly alt: string;
  public readonly fileName: string;
  public readonly title: string;
  public readonly duration?: number;
  public readonly src?: Array<string> | undefined | null;
  public readonly source?: string | undefined | null;
  public readonly deleteddate?: string | undefined | null;

  constructor(
    id: number,
    path: string,
    alt: string,
    fileName: string,
    title: string,
    duration?: number,
    src?: Array<string> | undefined | null,
    source?: string | undefined | null,
    deleteddate?: string | undefined | null
  ) {
    this.id = id;
    this.path = path;
    this.alt = alt;
    this.fileName = fileName;
    this.title = title;
    this.duration = duration;
    this.src = src;
    this.source = source;
    this.deleteddate = deleteddate;
  }
}

interface ArticleLevelArgs {
  wpId: number;
  name: string;
  slug: string;
  childArticles?: Array<Article>;
}

export class ArticleLevel {
  public readonly wpId: number;
  public readonly name: string;
  public readonly slug: string;
  public readonly childArticles?: Array<Article>;

  constructor(args: ArticleLevelArgs) {
    this.wpId = args.wpId;
    this.name = args.name;
    this.slug = args.slug;
    this.childArticles = args.childArticles;
  }
}

export interface ImageArticle {
  id: number;
  url: string;
  url_large: string;
}

export interface ReadLevel {
  wpId: number;
  level: number;
}

export interface GreepElements {
  kode: string;
  description: string;
}

export interface ArticleArgs {
  id: number;
  title: string;
  url?: string;
  excerpt?: string;
  images?: ImageArticle;
  grades?: Array<Grade>;
  subjects?: Array<Subject>;
  isRead?: boolean;
  wpId?: number;
  levels?: Array<ArticleLevel>;
  correspondingLevelArticleId?: number | null;
  isSelected?: boolean;
  readLevel?: ReadLevel;
  grepCoreelements?: Array<GreepElements>;
  grepGoals?: Array<GreepElements>;
  grepMaintopic?: Array<GreepElements>;
  isHidden?: boolean;
}

export class Article {
  public id: number;
  public readonly title: string;
  public readonly url?: string;
  public excerpt?: string;
  public images?: ImageArticle;
  public grades?: Array<Grade>;
  public subjects?: Array<Subject>;
  public isRead?: boolean;
  public wpId?: number;
  public levels?: Array<ArticleLevel>;
  public correspondingLevelArticleId?: number | null;
  public isSelected?: boolean;
  public readLevel?: ReadLevel;
  public grepCoreelements?: Array<GreepElements>;
  public grepGoals?: Array<GreepElements>;
  public grepMaintopic?: Array<GreepElements>;
  public isHidden?: boolean;

  constructor(args: ArticleArgs) {
    this.id = args.id;
    this.title = args.title;
    this.url = args.url;
    this.excerpt = args.excerpt;
    this.images = args.images;
    this.grades = args.grades;
    this.subjects = args.subjects;
    this.isRead = args.isRead;
    this.wpId = args.wpId;
    this.levels = args.levels!;
    this.correspondingLevelArticleId = args.correspondingLevelArticleId;
    this.isSelected = args.isSelected;
    this.readLevel = args.readLevel;
    this.grepCoreelements = args.grepCoreelements;
    this.grepGoals = args.grepGoals;
    this.grepMaintopic = args.grepMaintopic;
    this.isHidden = args.isHidden;
  }
}

export interface DomainArgs {
  id: number;
  title: string;
  url?: string;
  description?: string;
  featuredImage?: string;
  image?: string;
  grades?: Array<Grade>;
  subjects?: Array<Subject>;
  isRead?: boolean;
  grepGoals?: Array<GreepElements>;
}

export class Domain {
  public id: number;
  public readonly title: string;
  public readonly description?: string;
  public readonly url?: string;
  public grades?: Array<Grade>;
  public subjects?: Array<Subject>;
  public featuredImage?: string;
  public image?: string;
  public isRead?: boolean;
  public grepGoals?: Array<GreepElements>;
  constructor(args: DomainArgs) {
    this.id = args.id;
    this.title = args.title;
    this.description = args.description;
    this.url = args.url;
    this.featuredImage = args.featuredImage;
    this.image = args.image;
    this.grades = args.grades;
    this.subjects = args.subjects;
    this.isRead = args.isRead;
    this.grepGoals = args.grepGoals;
  }
}
