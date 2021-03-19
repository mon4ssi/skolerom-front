import isNull from 'lodash/isNull';
import { action, computed, observable } from 'mobx';
import { EntityType } from 'utils/enums';

import { Article, Filter, TypedQuestion } from '../assignment/Assignment';
import { injector } from '../Injector';
import {
  ASSIGNMENT_EVALUATION_SERVICE,
  AssignmentEvaluationService,
  TEACHING_PATH_EVALUATION_SERVICE,
  TeachingPathEvaluationService
} from './service';
import { Answer } from '../assignment/questionary/Questionary';
import { AnswerDraft, EvaluateTeachingPathNode, TeachingPathAnswer, StudentTeachingPathAnswer } from './api';

export const ASSIGNMENT_EVALUATION_REPO = 'ASSIGNMENT_EVALUATION_REPO';
export const TEACHING_PATH_EVALUATION_REPO = 'TEACHING_PATH_EVALUATION_REPO';

export interface TeachingPathEvaluationRepo {
  getTeachingPathAnswersList(teachingPathId: number, filter: Filter): Promise<{answersList: Array<EditableEvaluation>, total_pages: number}>;
  getDraftAnswersById(teachingPathId: number, answerId: number): Promise<AnswerDraft>;
  getAnswersById(entityId: number, answerId: number): Promise<TeachingPathAnswer>;
  getNodeById(nodeId: number, teachingPathId: number): Promise<EvaluateTeachingPathNode>;
  saveEvaluation(entityId: number, answerId: number, evaluation: EditableEvaluation): Promise<void>;
  publishEvaluation(entityId: number, answerId: number, evaluation: EditableEvaluation): Promise<void>;
  getEvaluationForStudent(teachingPathId: number, answerId: number): Promise<StudentTeachingPathAnswer>;
}

export interface AssignmentEvaluationRepo {
  getListOfAnswersToAssignment(assignmentId: number, filter: Filter): Promise<{listAnswers: Array<EditableEvaluation>, total_pages: number}>;
  getAnswersById(entityId: number, answerId: number): Promise<EvaluationAnswer>;
  getAnswersByIdForStudent(entityId: number, answerId: number): Promise<{answerInfo: EvaluationAnswer, evaluation: EditableEvaluation}>;
  getDraftAnswersById(entityId: number, answerId: number): Promise<AnswerDraft>;
  saveEvaluation(entityId: number, answerId: number, evaluation: EditableEvaluation): Promise<void>;
  publishEvaluation(entityId: number, answerId: number, evaluation: EditableEvaluation): Promise<void>;
}

export interface EvaluationArgs {
  entityType: EntityType;
  studentId?: number;
  studentName?: string;
  answerId?: number;
  isAnswered?: boolean;
  startDate?: string;
  endDate?: string;
  isPassed: boolean | null;
  mark: number | null;
  status: boolean | null;
}

export class Evaluation {
  protected readonly _entityType: EntityType;
  protected _studentId: number | undefined;
  protected _studentName: string | undefined;
  protected _answerId: number | undefined;
  protected _isAnswered: boolean | undefined;
  protected _startDate: string | undefined;
  protected _endDate: string | undefined;
  protected _isPassed: boolean | null;
  protected _mark: number | null;
  protected _status: boolean | null;

  constructor(args: EvaluationArgs) {
    this._entityType = args.entityType;
    this._answerId = args.answerId;
    this._studentName = args.studentName;
    this._status = args.status;
    this._isPassed = args.isPassed;
    this._mark = args.mark;
    this._studentId = args.studentId;
    this._isAnswered = args.isAnswered;
    this._startDate = args.startDate;
    this._endDate = args.endDate;
  }

  public get entityType() {
    return this._entityType;
  }

  public get studentId(): number {
    return this._studentId!;
  }

  public get studentName(): string {
    return this._studentName!;
  }

  public get answerId(): number {
    return this._answerId!;
  }

  public get isAnswered(): boolean {
    return this._isAnswered!;
  }

  public get endDate(): string {
    return this._endDate!;
  }

  public get isPassed(): boolean | null {
    return this._isPassed;
  }

  public get mark(): number | null {
    return this._mark;
  }

  public get status(): boolean | null {
    return this._status;
  }
}

interface TeachersComment {
  commentToEntity: string;
  commentsToAnswers?: Array<{questionAnswerId: number, comment: string}>;
}

interface TeacherAdditions {
  uuid?: string;
  author?: string;
  content: TeachersComment;
  isReadyToEvaluate?: boolean;
}

export class EditableEvaluation extends Evaluation {

  @computed
  public get uuid() {
    return this._uuid;
  }

  @computed
  public get author() {
    return this._author;
  }

  @computed
  public get content() {
    return this._content;
  }

  @computed
  public get isReadyToEvaluate() {
    return this._isReadyToEvaluate;
  }

  @observable public _uuid: string | undefined;
  @observable public _author: string | undefined;
  @observable public _content: TeachersComment;
  @observable public _mark: number | null;
  @observable public _status: boolean | null;
  @observable public _isPassed: boolean | null;
  @observable public _isReadyToEvaluate: boolean | undefined;

  constructor(args: EvaluationArgs & TeacherAdditions) {
    super({ ...args });
    this._uuid = args.uuid;
    this._author = args.author;
    this._content = args.content;
    this._mark = args.mark;
    this._status = args.status;
    this._isPassed = args.isPassed;
    this._isReadyToEvaluate = args.isReadyToEvaluate;
  }

  @action
  public setMark(mark: number | null) {
    this._mark = mark;
  }

  @action
  public setStatus(status: boolean | null) {
    this._status = status;
  }

  @action
  public setPassedStatus(status: boolean | null) {
    this._isPassed = status;
  }

  @action
  public setUuid(id: string) {
    this._uuid = id;
  }

  @action
  public setCommentToEntity(comment: string) {
    this._content.commentToEntity = comment;
  }

  @action
  public setCommentToAnswer(comment: string, answerId: number) {
    const answerIndex = this._content.commentsToAnswers!.findIndex(item => item.questionAnswerId === answerId);
    if (answerIndex < 0) {
      return this._content.commentsToAnswers!.push({ comment, questionAnswerId: answerId });
    }
    return this._content.commentsToAnswers!.splice(answerIndex, 1, { comment, questionAnswerId: answerId });
  }
}

export class AssignmentEvaluationList {
  private evaluationService: AssignmentEvaluationService = injector.get<AssignmentEvaluationService>(ASSIGNMENT_EVALUATION_SERVICE);
  public filter: Filter = new Filter();

  public setFiltersPage(number: number) {
    this.filter.page = number;
  }

  public async getListOfAnswersToAssignment(id: number) {
    return this.evaluationService.getListOfAnswersToAssignment(id, this.filter);
  }
}

export class TeachingPathAnswersList {
  private evaluationService: TeachingPathEvaluationService = injector.get<TeachingPathEvaluationService>(TEACHING_PATH_EVALUATION_SERVICE);
  public filter: Filter = new Filter();

  public setFiltersPage(number: number) {
    this.filter.page = number;
  }

  public async getTeachingPathAnswersList(id: number) {
    return this.evaluationService.getTeachingPathAnswersList(id, this.filter);
  }
}

interface EvaluationAnswerArgs {
  revisionId: number;
  assignmentId?: number;
  comment: string | null;
  revisionContent: {
    answers: Array<{ answerBlock: Answer, comment?: string }>;
    questions: Array<TypedQuestion>;
  };
  readArticleData: Array<Article>;
}

export class EvaluationAnswer {
  private _revisionId: number;
  private _assignmentId?: number;
  private _comment: string | null;
  private _readArticleData: Array<Article>;
  public revisionContent: { answers: Array<{ answerBlock: Answer, comment?: string }>; questions: Array<TypedQuestion> };

  constructor(args: EvaluationAnswerArgs) {
    this._revisionId = args.revisionId;
    this._assignmentId = args.assignmentId;
    this._comment = args.comment;
    this.revisionContent = args.revisionContent;
    this._readArticleData = args.readArticleData;
  }

  public get answers() {
    return this.revisionContent.answers;
  }

  public get comment() {
    return isNull(this._comment) ? undefined : this._comment;
  }

  public get readArticleData() {
    return this._readArticleData;
  }

  public get assignmentId() {
    return this._assignmentId;
  }
}

interface StudentEvaluationAnswerRevisionContent {
  answers: Array<{
    comment: string | null,
    payload: string | Array<{ optionId: number, title: string }>;
    questionAnswerId: number;
    questionId: number;
    type: string;
  }>;
  questions: Array<TypedQuestion>;
  levels: Array<number>;
  numberOfQuestions: number;
  author: string;
}

interface StudentEvaluationAnswerArgs {
  assignmentId: number;
  comment: string;
  revisionContent: StudentEvaluationAnswerRevisionContent;
  readArticleData: Array<Article>;
  revisionId: number;
  isPassed: boolean | null;
  mark: number | null;
  status: string | null;
}

export class StudentEvaluationAnswer {
  public assignmentId: number;
  public comment: string;
  public revisionContent: StudentEvaluationAnswerRevisionContent;
  public readArticleData: Array<Article>;
  public revisionId: number;
  public isPassed: boolean | null;
  public mark: number | null;
  public status: string | null;

  constructor(args: StudentEvaluationAnswerArgs) {
    this.assignmentId = args.assignmentId;
    this.comment = args.comment;
    this.revisionContent = args.revisionContent;
    this.readArticleData = args.readArticleData;
    this.revisionId = args.revisionId;
    this.isPassed = args.isPassed;
    this.mark = args.mark;
    this.status = args.status;
  }
}
