import { observable, computed, action } from 'mobx';
import intl from 'react-intl-universal';

import { SAVE_DELAY } from 'utils/constants';
import { injector } from 'Injector';
import { Assignment, TypedQuestion } from 'assignment/Assignment';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

export const QUESTIONARY_REPO = 'QUESTIONARY_REPO';
const isSavingDuration = 1000;

export interface QuestionaryRepo {
  getNewQuestionaryByAssignmentId(id: number): Promise<Questionary>;
  getNewQuestionaryByAssignmentIdFromTeachingPath(id: number,  redirectData: RedirectData): Promise<Questionary>;
  saveQuestionary(questionary: Questionary, redirectData?: RedirectData): Promise<string>;
  publishQuestionary(questionary: Questionary): Promise<void>;
  publishFromTeachingPath(questionary: Questionary, redirectData: RedirectData): Promise<void>;
  deleteQuestionary(questionary: Questionary): Promise<void>;
  revertQuestionary(questionary: Questionary): Promise<Questionary>;
  getAssignmentQuestionaryById(assignmentId: number): Promise<Questionary>;
  setReadStatusArticle(
    idAssignment: number,
    idRevision: number,
    idArticle: number,
    levelId: number,
    graduation: number
  ): Promise<void>;
}

export type AnswerValue = string | Array<string>;

interface AnswerArgs {
  questionary: Questionary;
  key: TypedQuestion;
  value: AnswerValue;
}

export interface RedirectData {
  teachingPath: number;
  node: number;
}

export class Answer {

  @observable protected _questionary: Questionary;
  @observable protected _key: TypedQuestion;
  @observable protected _value: AnswerValue;

  constructor(args: AnswerArgs) {
    this._questionary = args.questionary;
    this._key = args.key;
    this._value = args.value;
  }

  @computed
  public get questionary() {
    return this._questionary;
  }

  @computed
  public get key() {
    return this._key;
  }

  @computed
  public get value() {
    return this._value;
  }

  @action
  public setValue(value: AnswerValue, redirectData?: RedirectData) {
    this._value = !value.length ?
      '' :
      value;
    this.questionary.save(redirectData);
  }

}

export interface QuestionaryArgs {
  id: number;
  assignment: Assignment;
  idRevision?: number;
  uuid?: string;
  answers?: Array<AnswerArgs>;
  isPublished?: boolean;
  updatedAt?: string;
  redirectData?: RedirectData;
}

export class Questionary {

  protected repo: QuestionaryRepo = injector.get<QuestionaryRepo>(QUESTIONARY_REPO);

  protected readonly _id: number;
  protected readonly _idRevision: number | undefined;
  @observable private _isSavingRunning: boolean = false;
  @observable protected _uuid: string = '';
  @observable protected _assignment: Assignment;
  @observable protected _answers: Array<Answer>;
  @observable protected _isPublished: boolean = false;
  public isPublishing: boolean = false;
  @observable public isQuestionarySaving: boolean = false;
  @observable public _updatedAt: string = '';
  @observable public _redirectData: RedirectData | undefined;
  @observable public isQuestionaryChanged: boolean = false;

  constructor(args: QuestionaryArgs) {
    this._id = args.id;
    this._idRevision = args.idRevision;
    this._uuid = args.uuid || '';
    this._assignment = args.assignment;
    this._answers = args.answers ? args.answers.map(answer => new Answer(answer)) : [];
    this._isPublished = args.isPublished || false;
    this._updatedAt = args.updatedAt || '';
    this._redirectData = args.redirectData || undefined;
  }

  private validate() {
    this.validateAnswers();
  }

  private validateAnswers() {
    this.validateValues();
  }

  private validateValues() {
    return !(this.answers.map(answer => !!answer.value).includes(false));
  }

  @computed
  public get isSavingRunning(): boolean {
    return this._isSavingRunning;
  }

  @computed
  public get idRevision() {
    return this._idRevision;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get redirectData() {
    return this._redirectData;
  }

  @computed
  public get uuid() {
    return this._uuid;
  }

  @computed
  public get assignment() {
    return this._assignment;
  }

  @computed
  public get answers() {
    return this._answers;
  }

  @computed
  public get isPublished() {
    return this._isPublished;
  }

  public setAnswers(answers: Array<Answer>) {
    this._answers = answers;
  }

  public setUpdatedAt(updatedAt: string) {
    this._updatedAt = updatedAt;
  }

  @action
  public async save(redirectData?: RedirectData) {
    if (!this.isSavingRunning) {
      this._isSavingRunning = true;
      setTimeout(
        async () => {
          this.isQuestionarySaving = true;

          try {
            if (this.isPublishing) return;
            this.setUpdatedAt(await this.repo.saveQuestionary(this, redirectData));
          } catch (error) {
            if (error instanceof AlreadyEditingAssignmentError) {
              Notification.create({
                type: NotificationTypes.ERROR,
                title: intl.get('new assignment.already_editing')
              });
            } else {
              console.error('Error while saving draft:', error);
            }
          } finally {
            setTimeout(
              () => {
                this.isQuestionarySaving = false;
              },
              isSavingDuration
            );
            this._isSavingRunning = false;
            this.isQuestionaryChanged = true;
          }
        },
        SAVE_DELAY,
      );
    }
  }

  @action
  public async publish(redirectData?: RedirectData) {

    this.validate();
    this.isPublishing = true;
    return redirectData ? this.repo.publishFromTeachingPath(this, redirectData) : this.repo.publishQuestionary(this);
  }

  @computed
  public get isValid() {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

}

export class AlreadyEditingAssignmentError extends Error {}
