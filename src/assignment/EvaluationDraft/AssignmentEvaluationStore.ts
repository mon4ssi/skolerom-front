import { action, computed, observable, toJS } from 'mobx';
import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';
import intl from 'react-intl-universal';

import { ARTICLE_SERVICE_KEY, Article, Assignment } from 'assignment/Assignment';
import { ArticleService, ASSIGNMENT_SERVICE, AssignmentService } from 'assignment/service';
import { USER_SERVICE, UserService } from 'user/UserService';
import { injector } from 'Injector';
import { EditableEvaluation, EvaluationAnswer, AssignmentEvaluationList } from 'evaluation/Evaluation';
import { ASSIGNMENT_EVALUATION_SERVICE, AssignmentEvaluationService } from 'evaluation/service';
import { debounce } from 'utils/debounce';
import { SAVE_DELAY, SHOW_MESSAGE_DELAY, STATUS_FORBIDDEN } from 'utils/constants';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { StoreState, Locales } from 'utils/enums';

const passedMark = 2;

export class AssignmentEvaluationStore {

  @computed
  public get currentEvaluation() {
    return this._currentEvaluation;
  }

  @computed
  public get paginationTotalPages(): number {
    return this._paginationTotalPages;
  }

  @computed
  public get getListOfAnswers() {
    return toJS(this.answersList);
  }

  @computed
  public get evaluationAnswers() {
    return this._evaluationAnswers;
  }

  @computed
  public get displaySaveMessage() {
    return this._displaySaveMessage;
  }

  @computed
  public get evaluationCurrentPage() {
    return this.answersListService.filter.page;
  }

  private userService: UserService = injector.get(USER_SERVICE);
  private evaluationService: AssignmentEvaluationService = injector.get<AssignmentEvaluationService>(ASSIGNMENT_EVALUATION_SERVICE);
  private assignmentService: AssignmentService = injector.get<AssignmentService>(ASSIGNMENT_SERVICE);
  private answersListService: AssignmentEvaluationList = new AssignmentEvaluationList();
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  private save = debounce(this.saveEvaluation, SAVE_DELAY);

  @observable private _evaluationAnswers: EvaluationAnswer | undefined = undefined;
  @observable public _paginationTotalPages: number = 1;
  @observable public _currentEvaluation: EditableEvaluation | null = null;
  @observable public answersList: Array<EditableEvaluation> = [];
  @observable public _displaySaveMessage: boolean = false;
  @observable public relatedArticles: Array<Article> = [];
  @observable public _currentAssignment: Assignment | null = null;

  @observable public answersListState = StoreState.PENDING;
  @observable public currentEntityState = StoreState.PENDING;
  @observable public relatedArticlesState: StoreState = StoreState.PENDING;

  public get currentEntity(): Assignment | null {
    return this._currentAssignment;
  }

  public get currentEvaluationId(): number | undefined {
    if (this._currentEvaluation) {
      return this._currentEvaluation.answerId;
    }
    return undefined;
  }

  @action
  public resetCurrentEntity = () => {
    this._evaluationAnswers = undefined;
  }

  @action
  public async getCurrentEntity(id: number) {
    this.currentEntityState = StoreState.LOADING;
    this._currentAssignment = await this.assignmentService.getAssignmentById(id);
    this.currentEntityState = StoreState.PENDING;
  }

  @action
  public getAnswersByPage(page: number, id: number) {
    this.answersListService.setFiltersPage(page);
    this.getAnswersList(id);
  }

  @action
  public calcPassedStatus() {
    return this.currentEvaluation && !isNull(this.currentEvaluation.mark) && this.currentEvaluation.mark >= passedMark;
  }

  @action
  public setMark(mark: number | null) {
    if (this._currentEvaluation) {
      this._currentEvaluation.setMark(mark);
      const isPassed = this.calcPassedStatus();
      if (isNull(mark)) {
        this._currentEvaluation.setPassedStatus(null);
      } else if (!isNil(isPassed)) {
        this._currentEvaluation.setPassedStatus(isPassed);
      }
      this.saveEvaluation();
    }
  }

  @action
  public setCommentToAnswer(comment: string, questionId: number) {
    if (this._currentEvaluation) {
      this._currentEvaluation.setCommentToAnswer(comment, questionId);
      this.save();
    }
  }

  @action
  public setCommentToEntity(comment: string) {
    if (this._currentEvaluation) {
      this._currentEvaluation.setCommentToEntity(comment);
      this.save();
    }
  }

  @action
  public setStatus(status: boolean | null) {
    if (this._currentEvaluation) {
      this._currentEvaluation.setStatus(status);
      this.saveEvaluation();
    }
  }

  @action
  public setCurrentEvaluation(id?: number) {
    if (id) {
      return this._currentEvaluation = this.answersList.find(item => item.answerId === id)!;
    }
    return this._currentEvaluation = null;
  }

  @action
  public async getAnswersList(id: number) {
    this.answersListState = StoreState.LOADING;
    const response = await this.answersListService.getListOfAnswersToAssignment(id);
    this.answersList = response.listAnswers;
    this._paginationTotalPages = response.total_pages;
    this.answersListState = StoreState.PENDING;
  }

  @computed
  public get currentLocale() {
    return this.userService.getCurrentLocale() || Locales.EN;
  }

  @action
  public async setFiltersPage(number: number) {
    this.answersListService.setFiltersPage(number);
    await this.getAnswersList(this._currentAssignment!.id);
  }

  @action
  public getAnswersById = async () => {
    if (this._currentEvaluation) {
      this._evaluationAnswers = await this.evaluationService.getAnswersById(this._currentAssignment!.id, this._currentEvaluation!.answerId);
      if (this._evaluationAnswers!.comment) {
        this._currentEvaluation!.setCommentToEntity(this._evaluationAnswers!.comment);
      }
      this._evaluationAnswers!.revisionContent.answers.forEach((answer) => {
        if (answer.comment) {
          this._currentEvaluation!.setCommentToAnswer(answer.comment, answer.answerBlock.key.id!);
        }
      });
    }
    this.getRelatedArticles();
  }

  @action
  public getAnswersByIdForStudent = async (assignmentId: number, answerId: number) => {
    const response = await this.evaluationService.getAnswersByIdForStudent(assignmentId, answerId);
    this._evaluationAnswers = response.answerInfo;
    this._currentEvaluation = response.evaluation;
  }

  @action
  public getDraftAnswersById = async () => {
    if (this._currentEvaluation) {
      const {
        uuid,
        commentToEntity
      } = await this.evaluationService.getDraftAnswersById(this._currentAssignment!.id, this._currentEvaluation!.answerId);
      this._currentEvaluation.setUuid(uuid);
      if (!isNull(commentToEntity)) {
        this._currentEvaluation.setCommentToEntity(commentToEntity);
      }
    }
  }

  @action
  public showSaveMessage = () => {
    this._displaySaveMessage = true;
    setTimeout(() => this._displaySaveMessage = false, SHOW_MESSAGE_DELAY);
  }

  public async saveEvaluation() {
    if (this._currentEvaluation) {
      await this.evaluationService.saveEvaluation(this._currentAssignment!.id, this._currentEvaluation!.answerId, this.currentEvaluation!);
      this.showSaveMessage();
    }
  }

  @action
  public publishEvaluation = async () => {
    try {
      if (isNull(this.currentEvaluation!.mark) && isNull(this.currentEvaluation!.isPassed)) {
        return Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('answers.validation.markOrStatus')
        });
      }
      await this.evaluationService.publishEvaluation(this._currentAssignment!.id, this._currentEvaluation!.answerId, this.currentEvaluation!);
    } catch (error : any) {
      if (error.response && error.response.status === STATUS_FORBIDDEN) {
        return Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('answers.validation.deadline')
        });
      }
      if (error instanceof EvaluationValidationError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('answers.validation.mark')
        });
      } else {
        console.error('Error while saving publish:', error.message);
      }
    }
  }

  public async getRelatedArticles() {
    try {
      this.relatedArticlesState = StoreState.LOADING;

      const ids = this.evaluationAnswers!.readArticleData.map(article => article.wpId!);
      if (ids && ids.length) {
        const articles = await this.articleService.getArticlesByIds(ids);

        const allArticles = this.evaluationAnswers!.readArticleData.map((article) => {
          const fullArticle = articles.find(item => item.id === article.wpId!);
          return {
            ...article,
            ...fullArticle,
            readLevel: article.readLevel,
          };
        });

        this.relatedArticlesState = StoreState.PENDING;
        return this.relatedArticles = allArticles;
      }

      this.relatedArticlesState = StoreState.PENDING;
      return this.relatedArticles = [];
    } catch (e) {
      this.relatedArticlesState = StoreState.ERROR;
      throw Error(`fetch related articles: ${e}`);
    }
  }
}

export class EvaluationValidationError extends Error {
  public readonly localizationKey: string;

  constructor(localizationKey: string) {
    super(localizationKey);
    this.localizationKey = localizationKey;
  }
}
