import { action, computed, observable, reaction, toJS } from 'mobx';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';

import { injector } from 'Injector';
import { Assignment, Article, ARTICLE_SERVICE_KEY, Attachment, Grade, QuestionAttachment, QuestionType, Subject, } from 'assignment/Assignment';
import { DraftAssignment, EditableImageChoiceQuestion, EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { ArticleService, ASSIGNMENT_SERVICE, AssignmentService } from 'assignment/service';
import { DRAFT_ASSIGNMENT_SERVICE, DraftAssignmentService } from 'assignment/assignmentDraft/service';
import { DEFAULT_AMOUNT_ARTICLES_PER_PAGE, STATUS_FORBIDDEN, DEBOUNCE_TIME } from 'utils/constants';
import { EditEntityLocaleKeys, Locales } from 'utils/enums';
import { debounce } from 'utils/debounce';
import { DISTRIBUTION_SERVICE, DistributionService } from 'distribution/service';
import { USER_SERVICE, UserService } from 'user/UserService';
import { AssignmentContainer } from 'assignment/assignmentContainer/AssignmentContainer';
import { Distribution } from 'distribution/Distribution';
import { AttachmentContentType } from './AttachmentContentTypeContext';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { TEACHING_PATH_SERVICE, TeachingPathService } from 'teachingPath/service';

const statusCode204 = 204;
const numberOfImagesForSkeleton = 12;
const numberOfVideosForSkeleton = 4;

const getAllChildArticlesIds = (article: Article) => {
  const qwe = article.levels![0] && article.levels![0].childArticles ? article.levels![0].childArticles.map(child => child.wpId || child.id) : [];
  return Array.from(new Set([Number(article.id), ...qwe]))!;
};

export enum CreationElements {
  Title = 'Title',
  Articles = 'Articles',
  Questions = 'Questions'
}

interface CreationElementsType {
  type: CreationElements;
  orderQuestion?: number;
}

interface CurrentContentBlock {
  orderQuestion: number;
  orderBlock: number;
}

interface CurrentContentBlock {
  orderQuestion: number;
  orderBlock: number;
}

export class NewAssignmentStore {
  private assignmentService: AssignmentService = injector.get<AssignmentService>(ASSIGNMENT_SERVICE);
  private draftAssignmentService: DraftAssignmentService = injector.get<DraftAssignmentService>(DRAFT_ASSIGNMENT_SERVICE);
  private distributionService: DistributionService = injector.get<DistributionService>(DISTRIBUTION_SERVICE);

  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);
  private userService: UserService = injector.get(USER_SERVICE);

  public currentArticlesPage: number = 1;

  public teachingPathService = injector.get<TeachingPathService>(TEACHING_PATH_SERVICE);

  @observable public fetchingArticles: boolean = false;
  @observable public visibilityArticles: boolean = false;
  @observable public isActiveButtons: boolean = false;
  @observable public fetchingAttachments: boolean = false;
  @observable public visibilityAttachments: boolean = false;
  @observable public showValidationErrors: boolean = false;
  @observable public showDeleteButton: boolean = false;
  @observable public assignmentContainer: AssignmentContainer | null = null;
  @observable public currentPreviewQuestion: number = -1;
  @observable public currentContentBlock: CurrentContentBlock = { orderQuestion: -1, orderBlock: -1 };
  @observable public allArticles: Array<Article> = [];
  @observable public isFetchedArticlesListFinished: boolean = false;
  public articlesForSkeleton: Array<Article> = new Array(DEFAULT_AMOUNT_ARTICLES_PER_PAGE).fill(new Article({ id: 0, title: '' }));
  @observable public allGrades: Array<Grade> = [];
  @observable public allSubjects: Array<Subject> = [];
  @observable public questionAttachments: Array<Attachment> = [];
  @observable public currentOrderOption: number = -1;
  @observable public searchValue: string = '';
  @observable public storedAssignment: Assignment | null = null;
  @observable public highlightingItem: CreationElementsType | undefined;

  public arrayForImagesSkeleton = new Array(numberOfImagesForSkeleton).fill('imageSkeletonLoader');
  public arrayForVideosSkeleton = new Array(numberOfVideosForSkeleton).fill('videoSkeletonLoader');

  public localeKey: string = EditEntityLocaleKeys.NEW_ASSIGNMENT;

  public getArticlesWithDebounce = debounce(this.getArticles, DEBOUNCE_TIME);

  @action
  private buildAssignmentContainer(assignment: DraftAssignment, distribution?: Distribution) {
    this.assignmentContainer = new AssignmentContainer({
      assignment,
      distribution,
    });
  }

  @computed
  public get ifSearchValueIsNumber() {
    return !isNaN(Number(this.searchValue.charAt(0)));
  }

  public setIsActiveButtons() {
    this.isActiveButtons = true;
  }

  public setIsActiveButtonsFalse() {
    this.isActiveButtons = false;
  }

  @computed
  public get highlightedItem() {
    return this.highlightingItem;
  }

  @action
  public setCurrentPreviewQuestion(number: number) {
    this.currentPreviewQuestion = number;
  }

  public isHighlightedItem(type: CreationElements, orderQuestion?: number) {
    if (!isUndefined(orderQuestion) && this.highlightingItem && this.highlightingItem.type === type) {
      return this.highlightingItem.orderQuestion === orderQuestion;
    }
    return this.highlightingItem && this.highlightingItem.type === type;
  }

  @action
  public setHighlightingItem(type: CreationElements, orderQuestion?: number) {
    if (type === CreationElements.Questions && !isUndefined(orderQuestion)) {
      return this.highlightingItem = { orderQuestion, type: CreationElements.Questions };
    }
    return this.highlightingItem = { type, orderQuestion: undefined };
  }

  @action
  public isMultipleChoice() {
    const currentQuestion = this.currentContentBlock.orderQuestion;
    if (this.assignmentContainer) {
      const question = this.assignmentContainer.assignment.questions.find(question => question.orderPosition === currentQuestion) as EditableQuestion;
      if (question && !isUndefined(question.type) && question.type === QuestionType.ImageChoice) {
        return true;
      }
      return false;
    }
    return false;
  }

  @computed
  public get currentEntity() {
    return this.assignmentContainer && this.assignmentContainer.assignment;
  }

  @action
  public storeAssignment = () => {
    this.storedAssignment = new Assignment(this.assignmentContainer!.assignment);
  }

  @action
  public clearStoredAssignment = () => {
    this.storedAssignment = null;
  }

  @computed
  public get filteredGroups() {

    const filteredGroups = this.currentDistribution!.groups.filter(
      group => group.name.toLowerCase().search(this.searchValue) !== -1
    );
    return this.ifSearchValueIsNumber ? filteredGroups : this.currentDistribution!.groups;
  }

  @computed
  public get filteredStudents() {
    const filteredStudentsInGroups = this.currentDistribution!.groups.map(
      group => this.ifSearchValueIsNumber ?
        group.assignedStudents :
        group.assignedStudents.filter(student => student.name.toLowerCase().search(this.searchValue) !== -1)
    );

    return filteredStudentsInGroups;
  }

  @computed
  public get filteredStudentsWithoutFilters() {
    return this.currentDistribution!.groups.map(group => group.assignedStudents);
  }

  @computed
  public get currentDistribution() {
    return this.assignmentContainer && this.assignmentContainer.distribution;
  }

  @computed
  public get selectedGroups() {
    const selectedGroups = this.currentDistribution!.groups.filter(
      group => group.isSelected
    );

    return selectedGroups;
  }

  @action
  public getFilteredGroups = () => {
    const filteredGroups = this.currentDistribution!.groups
    .filter(
      group => group.name.toLowerCase().search(this.searchValue) !== -1
    );

    return filteredGroups;
  }

  @computed
  public get articlesAmount() {
    return toJS(this.allArticles).length;
  }

  @computed
  public get questionAttachmentsList() {
    return this.questionAttachments.slice();
  }

  public get currentQuestion(): EditableQuestion | undefined {
    if (this.currentPreviewQuestion >= 0) {
      return this.currentEntity!.questions[this.currentPreviewQuestion];
    }

    return undefined;
  }

  @computed
  public get getCurrentOption() {
    return this.currentOrderOption;
  }

  @action
  public setCurrentOption(orderOption: number) {
    this.currentOrderOption = orderOption;
  }

  @action
  public setImageCurrentOption(image: QuestionAttachment) {
    const currentImageChoiceQuestion = this.currentQuestion as EditableImageChoiceQuestion;
    const currentOption = currentImageChoiceQuestion!._options.find(option => option.order === this.currentOrderOption);
    currentOption!.setImage(image);
  }

  @action
  public clearCurrentOption() {
    this.currentOrderOption = -1;
  }

  @computed
  public get currentBlock() {
    return this.currentContentBlock;
  }

  @action
  public getAttachmentsFromCurrentBlock() {
    if (this.currentQuestion && this.currentQuestion.orderPosition === this.currentContentBlock.orderQuestion) {
      return this.currentQuestion!.content!.find(
        block => block.order === this.currentContentBlock.orderBlock);
    }
    return undefined;
  }

  @action
  public setCurrentContentBlock(orderQuestion: number, orderBlock: number) {
    this.currentContentBlock = { orderQuestion, orderBlock };
  }

  @action
  public addNewQuestion(type: QuestionType) {
    this.currentEntity!.setQuestionsWithError(null);
    this.currentEntity!.addNewQuestion(type);
    this.currentPreviewQuestion = this.currentEntity!.questions.length - 1;
  }

  @action
  public async saveAttachment(attachmentId: number) {
    try {
      return this.draftAssignmentService.saveAttachment(this.currentEntity!.id, attachmentId);
    } catch (e) {
      throw Error(`save wp image ${e}`);
    }
  }

  @action
  public async removeAttachment(attachmentId: number) {
    try {
      const statusCode = await this.draftAssignmentService.removeAttachment(this.currentEntity!.id, attachmentId);

      if (statusCode === statusCode204) {
        this.questionAttachments = this.questionAttachments.filter(
          attachment => attachment.id !== attachmentId
        );
      }
    } catch (e) {
      throw Error(`remove wp image ${e}`);
    }
  }

  public async createAssigment() {
    const assignment = await this.draftAssignmentService.getNewAssignment();
    this.buildAssignmentContainer(assignment);

    return this.currentEntity!;
  }

  public async getAssigmentForEditing(id: number) {
    try {
      const assignment = await this.draftAssignmentService.getDraftAssignmentForEditing(id);
      this.buildAssignmentContainer(assignment);
      this.currentPreviewQuestion = this.currentEntity!.questions.length - 1;
      this.setHighlightingItem(CreationElements.Title);

      return toJS(this.currentEntity);
    } catch (error) {
      if (error.response && error.response.status === STATUS_FORBIDDEN) {
        return null;
      }
      return Notification.create({
        type: NotificationTypes.ERROR,
        title: error.data.message
      });
    }
  }

  public async getDistributionData(id: number) {
    const distribution = await this.distributionService.getAssignmentDistributionData(id);

    this.buildAssignmentContainer(this.currentEntity!, distribution);

    return toJS(this.assignmentContainer);
  }

  public setPreviewQuestionByIndex(index: number): void {
    this.currentPreviewQuestion = index;
  }

  @action
  public async save(): Promise<void> {
    this.showValidationErrors = true;
    reaction(() => {
      if (this.currentEntity && this.currentEntity.isValid) {
        const result = this.currentEntity.isValid('save');
        if (!isNull(this.currentEntity!.questionsWithErrors)) {
          this.setHighlightingItem(CreationElements.Questions, this.currentEntity!.questionsWithErrors);
          this.setPreviewQuestionByIndex(this.currentEntity!.questionsWithErrors);
        }
        return result;
      }

    },       (isValid, reactionDisposer) => {
      if (isValid) {
        this.showValidationErrors = false;
        this.currentEntity!.setQuestionsWithError(null);
        reactionDisposer.dispose();
      }
    });
    return this.currentEntity!.saveAssignment();
  }

  @action
  public async publish(): Promise<void> {
    this.showValidationErrors = true;
    reaction(() => this.currentEntity && this.currentEntity.isValid('publish'), (isValid, reactionDisposer) => {
      if (isValid) {
        this.showValidationErrors = false;
        reactionDisposer.dispose();
      }
    });
    return this.currentEntity!.publish();
  }

  @action
  public async distribute(): Promise<void> {
    this.showValidationErrors = true;

    reaction(() => this.currentDistribution && this.currentDistribution.isValid, (isValid, reactionDisposer) => {
      if (isValid) {
        this.showValidationErrors = false;
        reactionDisposer.dispose();
      }
    });

    return this.currentDistribution!.distributeAssignment();
  }

  @action
  public resetCurrentArticlesPage() {
    this.currentArticlesPage = 1;
  }

  @action
  public resetArticlesList() {
    this.allArticles = [];
  }

  public getIsDraftSaving(): boolean {
    return this.currentEntity!.getIsDraftSaving();
  }

  public getAllArticles(): Array<Article> {
    return toJS(this.allArticles);
  }

  public getAllGrades(): Array<Grade> {
    return toJS(this.allGrades);
  }

  public getAllSubjects(): Array<Subject> {
    return toJS(this.allSubjects);
  }

  @action
  public async getArticles({
    perPage = DEFAULT_AMOUNT_ARTICLES_PER_PAGE,
    isNextPage = false,
    ...rest
  }) {
    if (!(this.fetchingArticles && isNextPage)) {
      this.fetchingArticles = true;
      this.currentArticlesPage = isNextPage ? this.currentArticlesPage + 1 : this.currentArticlesPage;

      try {
        const articles = await this.articleService!.getArticles({
          perPage,
          order: rest.order,
          grades: rest.grades,
          subjects: rest.subjects,
          searchTitle: rest.searchTitle,
          page: this.currentArticlesPage,
        });

        this.allArticles = isNextPage ? this.allArticles.concat(articles) : articles;
        if (articles.length < perPage) {
          this.isFetchedArticlesListFinished = true;
        }
      } catch (e) {
        this.allArticles = [];
        throw Error(`get articles ${e}`);
      } finally {
        this.fetchingArticles = false;
      }
    }
  }

  @action
  public resetIsFetchedArticlesListFinished() {
    this.isFetchedArticlesListFinished = false;
  }

  public async getGrades() {
    this.allGrades = await this.assignmentService.getGrades();
  }

  public async getSubjects() {
    this.allSubjects = await this.assignmentService.getSubjects();
  }

  public async createAssignmentWithArticle(
    postID: number
  ): Promise<{ isFinish: boolean; isCreated: boolean }> {
    const articleResponse = await this.articleService.getArticlesByIds([postID]);
    const searchableArticle = articleResponse[0];

    if (searchableArticle) {
      const assigment: DraftAssignment = await this.createAssigment();
      assigment.setArticle(searchableArticle);
      await this.currentEntity!.saveImmediate();
      return { isFinish: true, isCreated: true };
    }

    Notification.create({
      type: NotificationTypes.ERROR,
      title: 'Wrong article id'
    });

    return { isFinish: true, isCreated: false };
  }

  public async fetchQuestionAttachments(typeAttachments: AttachmentContentType): Promise<void> {
    if (this.currentEntity!.relatedArticles.length <= 0) {
      this.questionAttachments = [];
      return;
    }

    this.fetchingAttachments = true;

    try {
      switch (typeAttachments) {
        case AttachmentContentType.image: {
          this.questionAttachments =
            (await this.articleService.fetchImages(
              this.currentEntity!.relatedArticles.map(getAllChildArticlesIds).flat()
            )) || [];
          break;
        }
        case AttachmentContentType.video: {
          this.questionAttachments =
            (await this.articleService.fetchVideos(
              this.currentEntity!.relatedArticles.map(getAllChildArticlesIds).flat()
            )) || [];
          break;
        }
        default:
          break;
      }

    } catch (e) {
      this.questionAttachments = [];
      this.fetchingAttachments = false;
      throw Error(`fetch question attachments: ${e}`);
    }

    this.fetchingAttachments = false;
  }

  public getUpdatedAt() {
    return this.currentEntity!.updatedAt;
  }

  public duplicateQuestion(question: EditableQuestion) {
    this.currentEntity!.addQuestion(
      question.duplicateWithOrder(this.currentEntity!.questions.length)
    );
  }

  public clearAssignmentContainer() {
    this.assignmentContainer = null;
    this.showValidationErrors = false;
  }

  public getCurrentLocale() {
    return this.userService.getCurrentLocale() || Locales.EN;
  }

  public getCurrentUser = () => (
    this.userService.getCurrentUser()
  )

  public getPostID() {
    return this.userService.getPostID();
  }

  public setPostID(postID: number) {
    this.userService.setPostID(postID);
  }

  public getReferralToken() {
    return this.userService.getAssignmentReferralToken();
  }

  public setReferralToken(referralToken: string) {
    this.userService.setAssignmentReferralToken(referralToken);
  }

  public getAssignmentIdFromLocalStorage() {
    return this.userService.getAssignmentId();
  }

  public setAssignmentIdToLocalStorage(assignmentId: string) {
    this.userService.setAssignmentId(assignmentId);
  }

  public async assignStudentToAssignment(assignmentId:string, referralToken: string) {
    return this.distributionService.assignStudentToAssignment(assignmentId, referralToken);
  }
  public async getGrepFilters() {
    return this.teachingPathService.getGrepFilters();
  }
  public async getGrepGoalsFilters(grepCoreElementsIds: Array<number>, grepMainTopicsIds: Array<number>, gradesIds: Array<number>, subjectsId: Array<number>, orderGoalsCodes: Array<string>) {
    return this.teachingPathService.getGrepGoalsFilters(grepCoreElementsIds, grepMainTopicsIds, gradesIds, subjectsId, orderGoalsCodes);
  }

}
