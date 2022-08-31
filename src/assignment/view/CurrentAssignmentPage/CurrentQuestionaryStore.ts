import { action, computed, observable, reaction, toJS } from 'mobx';
import { Route, Switch, Redirect, withRouter, RouteComponentProps, useHistory, Router } from 'react-router-dom';
import intl from 'react-intl-universal';
import { injector } from 'Injector';

import { QUESTIONARY_SERVICE, QuestionaryService } from 'assignment/questionary/service';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { Article, ARTICLE_SERVICE_KEY, Assignment, Question } from 'assignment/Assignment';
import { Answer, Questionary, RedirectData } from 'assignment/questionary/Questionary';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { ArticleService, AssignmentService, ASSIGNMENT_SERVICE } from '../../service';
import { USER_SERVICE, UserService } from '../../../user/UserService';

const COVER_INDEX = -2;

export class CurrentQuestionaryStore {

  private questionaryService: QuestionaryService = injector.get<QuestionaryService>(QUESTIONARY_SERVICE);
  private userService: UserService = injector.get<UserService>(USER_SERVICE);
  private assignmentService: AssignmentService = injector.get(ASSIGNMENT_SERVICE);
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  @observable public isLoading: boolean = false;
  @observable public currentQuestionary: Questionary | null = null;
  @observable public isMultipleQuestion: boolean = false;
  @observable public assignment: Assignment | null = null;
  @observable public questions: Array<Question> = [];
  @observable public answers: Array<Answer> = [];
  @observable public showValidationErrors: boolean = false;
  @observable public currentQuestionIndex: number = 0;
  @observable public isLoadingArticles: boolean = false;
  public isArrowsTooltipVisible: boolean = true;
  @observable public isStartedAssignment: boolean = false;
  @observable public relatedArticles: Array<Article> = [];
  public allArticlesread: boolean = false;

  public async createQuestionaryByAssignmentId(id: number, redirectData?: RedirectData) {
    this.isLoading = true;
    const questionary = redirectData !== undefined
      ? await this.questionaryService.getNewQuestionaryByAssignmentIdFromTeachingPath(id, redirectData)
      : await this.questionaryService.getNewQuestionaryByAssignmentId(id);
    this.currentQuestionary = questionary;
    this.assignment = questionary.assignment;
    this.questions = questionary.assignment.questions;
    this.answers = questionary.answers;
    this.isLoading = false;

    return this.currentQuestionary;
  }

  public async getQuestionaryById(assignmentId: number) {
    this.isLoading = true;
    const questionary = await this.questionaryService.getAssignmentQuestionaryById(assignmentId);
    this.currentQuestionary = questionary;
    this.assignment = questionary.assignment;
    this.questions = questionary.assignment.questions;
    this.answers = questionary.answers;
    this.isLoading = false;

    return this.currentQuestionary;
  }

  public getCurrentUser = () => this.userService.getCurrentUser();

  @computed
  public get questionTitlesList() {
    return this.questions.map(question => question.title);
  }

  @computed
  public get questionTitlesListWithSubmit() {
    return [
      ...this.questionTitlesList,
      intl.get('current_assignment_page.Review & Submit')
    ] as Array<string>;
  }

  @computed
  public get currentQuestion() {
    if (this.currentQuestionIndex >= 0) {
      return this.questions[this.currentQuestionIndex];
    }
    return null;
  }

  @computed
  public get currentAnswer(): Answer {
    return this.answers[this.currentQuestionIndex];
  }

  @computed
  public get deadline() {
    return this.assignment!.deadline;
  }

  @computed
  public get featuredImage() {
    return (this.assignment) ? this.assignment!.featuredImage : '';
  }

  @computed
  public get backgroundImage() {
    return (this.assignment) ? this.assignment!.backgroundImage : '';
  }

  @computed
  public get authoravatar() {
    return this.assignment!.authoravatar;
  }

  @computed
  public get author() {
    return this.assignment!.author;
  }

  public get numberOfQuestions(): number {
    return this.questions.length;
  }

  @computed
  public get relatedAllArticles(): Array<Article> {
    return this.relatedArticles;
  }

  public get numberOfAnsweredQuestions(): number {
    const answersWithValue = this.answers.filter(answer => toJS(answer.value).length);
    return answersWithValue.length;
  }

  @action
  public getIsReadArticles = (): boolean =>
    this.relatedArticles.some(i => i.isRead === true)

  @action
  public async setReadStatusToArticle(idArticle: number, levelId: number, graduation: number, isStudent: boolean) {
    if (isStudent) await this.questionaryService.setReadStatusArticle(this.assignment!.id, this.currentQuestionary!.idRevision!, idArticle, levelId, graduation);
    let indexArticle = -1;
    const article = this.relatedArticles.find((article, index) => {
      if (article.id === idArticle) {
        indexArticle = index;
        return article;
      }
      return null;
    });
    article!.isRead = true;
    this.relatedArticles.splice(indexArticle, 1, article!);
    const readArticles = this.relatedArticles.filter(article => article.isRead);
    if (this.relatedArticles.length === readArticles.length) {
      this.currentQuestionary!.isQuestionaryChanged = true;
      this.setCurrentQuestion(0);
    }
  }

  @action
  public setStartedAssignment(value: boolean) {
    this.isStartedAssignment = value;
  }

  @action
  public async getRelatedArticles() {
    this.setCurrentQuestion(COVER_INDEX);
    if (this.assignment!) {
      try {
        const ids = this.assignment!.relatedArticles ? this.assignment!.relatedArticles.map(i => i.id) : [];
        if (ids && ids.length && ids.length > 0) {
          this.isLoadingArticles = false;
          const articles = await this.articleService.getArticlesByIds(ids);
          const allArticles = this.assignment!.relatedArticles.map((article) => {
            const fullArticles = articles.find(item => item.id === article.id);
            return {
              ...article,
              ...fullArticles,
              correspondingLevelArticleId: article.correspondingLevelArticleId,
              isRead: article.isRead
            };
          });
          this.isLoadingArticles = true;
          return this.relatedArticles = allArticles;
        }
        return this.relatedArticles = [];
      } catch (e) {
        throw Error(`fetch related articles: ${e}`);
      }
    } else {
      return this.relatedArticles = [];
    }

  }

  @action
  public setCurrentQuestion = (index: number) => {
    this.currentQuestionIndex = index;
  }

  @action
  public publishQuestionary = async (redirectData?: RedirectData): Promise<void> => {
    this.showValidationErrors = true;
    reaction(() => this.currentQuestionary!.isValid, (isValid, reaction) => {
      if (isValid) {
        this.showValidationErrors = false;
        reaction.dispose();
      }
    });
    return this.currentQuestionary!.publish(redirectData);
  }

  public async deleteQuestionary() {
    this.questionaryService.deleteQuestionary();
  }

  public async revertQuestionary() {
    const response = await this.questionaryService.revertQuestionary();
    this.currentQuestionary = response;
    this.answers = response.answers;
    this.relatedArticles = this.relatedArticles.map(article => ({ ...article, isRead: false }));
  }

  @action
  public handleShowArrowsTooltip = (isVisible: boolean) => {
    this.isArrowsTooltipVisible = isVisible;
  }

  @action
  public async downloadTeacherGuidancePDF(id: number) {
    return this.assignmentService.downloadTeacherGuidancePDF(id);
  }
}
