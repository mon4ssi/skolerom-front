import { action, computed, observable, reaction, toJS } from 'mobx';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import intl from 'react-intl-universal';
import { injector } from 'Injector';
import { Assignment, Article, ARTICLE_SERVICE_KEY, Attachment, Grade, QuestionAttachment, QuestionType, Subject, GreepElements, FilterArticlePanel, Source, CustomImgAttachment } from 'assignment/Assignment';
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
import { contextType } from 'react-copy-to-clipboard';

const statusCode204 = 204;
const numberOfImagesForSkeleton = 12;
const numberOfCustomImagesForSkeleton = 12;
const numberOfVideosForSkeleton = 4;
const delayFocus = 250;

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
  @observable public hiddenArticles: boolean = false;
  @observable public isActiveButtons: boolean = false;
  @observable public isDisabledButtons: boolean = false;
  @observable public fetchingAttachments: boolean = false;
  @observable public fetchingCustomImageAttachments: boolean = false;
  @observable public visibilityAttachments: boolean = false;
  @observable public showValidationErrors: boolean = false;
  // @observable public open: boolean = false;
  @observable public showDeleteButton: boolean = false;
  @observable public assignmentContainer: AssignmentContainer | null = null;
  @observable public currentPreviewQuestion: number = -1;
  @observable public currentContentBlock: CurrentContentBlock = { orderQuestion: -1, orderBlock: -1 };
  @observable public allArticles: Array<Article> = [];
  @observable public isFetchedArticlesListFinished: boolean = false;
  public articlesForSkeleton: Array<Article> = new Array(DEFAULT_AMOUNT_ARTICLES_PER_PAGE).fill(new Article({ id: 0, title: '' }));
  @observable public allGrades: Array<Grade> = [];
  @observable public allSubjects: Array<Subject> = [];
  @observable public allSources: Array<Source> = [];
  @observable public questionAttachments: Array<Attachment> = [];
  @observable public questionCustomAttachments: Array<CustomImgAttachment> = [];
  @observable public currentOrderOption: number = -1;
  @observable public searchValue: string = '';
  @observable public storedAssignment: Assignment | null = null;
  @observable public highlightingItem: CreationElementsType | undefined;
  @observable public allArticlePanelFilters: FilterArticlePanel | null = null;
  @observable public titleButtonGuidance: string = '';

  public arrayForImagesSkeleton = new Array(numberOfImagesForSkeleton).fill('imageSkeletonLoader');
  public arrayForCustomImagesSkeleton = new Array(numberOfCustomImagesForSkeleton).fill('imageSkeletonLoader');
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

  public get getTitleButtonGuidance() {
    return this.titleButtonGuidance;
  }

  @action
  public setTitleButtonGuidance(drafAssignment: DraftAssignment | undefined) {
    let hasGuidance: boolean = false;
    const guidanceBlank1 = '<p><br></p>';
    const guidanceBlank2 = '';

    if (drafAssignment!.guidance !== guidanceBlank1 && drafAssignment!.guidance !== guidanceBlank2) {
      hasGuidance = true;
    } else {
      drafAssignment!.questions.forEach((child) => {
        if (child.guidance !== guidanceBlank1 && child.guidance !== guidanceBlank2) {
          hasGuidance = true;
          return true;
        }
      });
    }

    this.titleButtonGuidance = hasGuidance ? intl.get('teacherGuidance.buttons.edit') : intl.get('teacherGuidance.buttons.add');
  }

  public relatedArticlesIsHidden() {
    this.currentEntity!.relatedArticles.forEach((e) => {
      e.isHidden = this.hiddenArticles;
    });
  }

  public setIsActiveButtons() {
    this.isActiveButtons = true;
  }

  public setIsDisabledButtons() {
    this.isDisabledButtons = true;
  }

  public setIsActiveButtonsFalse() {
    this.isActiveButtons = false;
  }

  public setIsDisabledButtonsFalse() {
    this.isDisabledButtons = false;
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
  public setCustomImageCurrentOption(image: QuestionAttachment) {
    const currentCustomImageChoiceQuestion = this.currentQuestion as EditableImageChoiceQuestion;
    const currentOption = currentCustomImageChoiceQuestion!._options.find(option => option.order === this.currentOrderOption);
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

    }, (isValid, reactionDisposer) => {
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

  public getAllSources(): Array<Source> {
    return toJS(this.allSources);
  }

  /*public getIsOpen(): boolean {
    return this.open;
  }*/

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
          page: this.currentArticlesPage,
          order: rest.order,
          grades: rest.grades,
          subjects: rest.subjects,
          core: rest.core,
          goal: rest.goal,
          multi: rest.multi,
          source: rest.source,
          searchTitle: rest.searchTitle,
          lang: rest.lang
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

  public async getSources() {
    this.allSources = await this.assignmentService.getSources();
  }

  public getGoalsByArticle() {
    const arrayGoals: Array<String> = [];
    if (this.currentEntity!.relatedArticles.length > 0) {
      this.currentEntity!.relatedArticles.forEach((element) => {
        if (element.grepGoals!.length > 0) {
          element.grepGoals!.forEach((e) => {
            if (!arrayGoals.includes(e.kode)) {
              arrayGoals.push(e.kode);
            }
          });
        }
      });
    }
    return String(arrayGoals);
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
    this.fetchingCustomImageAttachments = true;
    try {
      switch (typeAttachments) {
        case AttachmentContentType.image: {
          this.questionAttachments =
            (await this.articleService.fetchImages(
              this.currentEntity!.relatedArticles.map(getAllChildArticlesIds).flat()
            )) || [];
          break;
        }
        case AttachmentContentType.customImage: {
          this.questionCustomAttachments =
            (await this.articleService.fetchCustomImages()).map(item => item).flat() || [];
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
      this.questionCustomAttachments = [];
      this.fetchingAttachments = false;
      this.fetchingCustomImageAttachments = false;
      throw Error(`fetch question attachments: ${e}`);
    }

    this.fetchingAttachments = false;
    this.fetchingCustomImageAttachments = false;
  }

  public async fetchQuestionCustomImagesAttachments(typeAttachments: AttachmentContentType): Promise<void> {
    this.fetchingCustomImageAttachments = true;
    try {
      switch (typeAttachments) {
        case AttachmentContentType.customImage: {
          this.questionCustomAttachments =
            (await this.articleService.fetchCustomImages()).map(item => item).flat() || [];
          break;
        }
        default:
          break;
      }
    } catch (e) {
      this.questionCustomAttachments = [];
      this.fetchingCustomImageAttachments = false;
      throw Error(`fetch question custom images attachments: ${e}`);
    }
    this.fetchingCustomImageAttachments = false;
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

  public getAllArticlePanelFilters() {
    return toJS(this.allArticlePanelFilters);
  }

  public async getFiltersArticlePanel(lang: string) {
    this.allArticlePanelFilters = await this.teachingPathService.getFiltersArticlePanel(lang);
  }

  public async assignStudentToAssignment(assignmentId: string, referralToken: string) {
    return this.distributionService.assignStudentToAssignment(assignmentId, referralToken);
  }

  public async getGradeWpIds(gradeWpIds: Array<number>) {
    return this.teachingPathService.getGradeWpIds(gradeWpIds);
  }

  public async getSubjectWpIds(subjectWpIds: Array<number>) {
    return this.teachingPathService.getSubjectWpIds(subjectWpIds);
  }

  public async getGrepFilters(grades: string, subjects: string) {
    return this.teachingPathService.getGrepFilters(grades, subjects);
  }
  public async getGrepFiltersAssignment(grades: string, subjects: string, coreElements?: string, goals?: string) {
    return this.assignmentService.getGrepFiltersAssignment(grades, subjects, coreElements, goals);
  }
  public async getGrepGoalsFilters(grepCoreElementsIds: Array<number>, grepMainTopicsIds: Array<number>, gradesIds: Array<number>, subjectsIds: Array<number>, orderGoalsCodes: Array<string>, perPage: number, page: number) {
    return this.teachingPathService.getGrepGoalsFilters(grepCoreElementsIds, grepMainTopicsIds, gradesIds, subjectsIds, orderGoalsCodes, perPage, page);
  }
  @action
  public async downloadTeacherGuidancePDF(id: number) {
    return this.assignmentService.downloadTeacherGuidancePDF(id);
  }
  @action
  public openTeacherGuidanceAssig = (nroLevel: string): void => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTGAssig') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGAssigBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.add('open');
    modalTGBack[0].classList.remove('hide');

    setTimeout(
      () => {
        const editDescript = (document.getElementsByClassName(`jr-desEdit${nroLevel}`)[0] as HTMLDivElement);
        const editInputText = (editDescript.getElementsByClassName('ql-editor')[0] as HTMLInputElement);
        editInputText.focus();
      },
      delayFocus
    );
  }
}
