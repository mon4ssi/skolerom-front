import { action, computed, observable, reaction, toJS } from 'mobx';
import { debounce } from 'utils/debounce';

import { injector } from 'Injector';
import { ArticleService, ASSIGNMENT_SERVICE, AssignmentService } from 'assignment/service';
import { DRAFT_TEACHING_PATH_SERVICE, DraftTeachingPathService } from 'teachingPath/teachingPathDraft/service';
import { Article, ARTICLE_SERVICE_KEY, Grade, Subject, FilterArticlePanel, Source, Assignment, Keyword } from 'assignment/Assignment';
import { TeachingPathContainer } from 'teachingPath/teachingPathContainer/teachingPathContainer';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { TeachingPathItemValue, TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { DEFAULT_AMOUNT_ARTICLES_PER_PAGE, DEBOUNCE_TIME } from 'utils/constants';
import { EditEntityLocaleKeys, Locales } from 'utils/enums';
import { Distribution } from 'distribution/Distribution';
import { DISTRIBUTION_SERVICE, DistributionService } from 'distribution/service';
import { USER_SERVICE, UserService } from 'user/UserService';
import { TEACHING_PATH_SERVICE, TeachingPathService } from 'teachingPath/service';
import { GreepElements } from 'assignment/factory';

const error400 = 400;

const TEMPORAL = 67933;

export class EditTeachingPathStore {

  private draftTeachingPathService = injector.get<DraftTeachingPathService>(DRAFT_TEACHING_PATH_SERVICE);
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);
  private assignmentService: AssignmentService = injector.get<AssignmentService>(ASSIGNMENT_SERVICE);
  private distributionService: DistributionService = injector.get<DistributionService>(DISTRIBUTION_SERVICE);
  private teachingPathService = injector.get<TeachingPathService>(TEACHING_PATH_SERVICE);
  private userService: UserService = injector.get(USER_SERVICE);

  private currentArticlesPage: number = 1;

  @observable public showValidationErrors: boolean = false;
  @observable public fetchingArticles: boolean = false;
  @observable public isFetchedArticlesListFinished: boolean = false;
  @observable public isActiveButtons: boolean = false;
  @observable public isDisabledButtons: boolean = false;
  @observable public hasMoreArticles: boolean = true;
  @observable public isEditArticles: boolean = false;
  @observable public editNodeArticlesItem: boolean = false;
  @observable public editNodeAssigmentItem: boolean = false;
  @observable public orientationNodeArticlesItem: string = '';
  @observable public isDraggable: boolean = false;
  @observable public articleInEdit: number = 0;
  @observable public assingmentInEdit: number = 0;

  @observable public isEditAssignments: boolean = false;
  @observable public isEditDomain: boolean = false;
  @observable public articlesList: Array<Article> = [];
  // tslint:disable-next-line: no-magic-numbers
  @observable public articlesForSkeleton: Array<Article> = new Array(6).fill(new Article({ id: 0, title: '' }));
  // tslint:disable-next-line: no-magic-numbers
  @observable public articlesForSkeletonEight: Array<Article> = new Array(8).fill(new Article({ id: 0, title: '' }));
  @observable public usedArticles: Array<Article> = [];
  @observable public selectedArticle: Article | null = null;
  @observable public teachingPathContainer: TeachingPathContainer | null = null;
  @observable public currentNode: EditableTeachingPathNode | null = null;
  @observable public selectedDragNode: EditableTeachingPathNode | null = null;
  @observable public selectedParentDragNode: EditableTeachingPathNode | null = null;
  @observable public searchValue: string = '';
  @observable public nodeUse: EditableTeachingPathNode | null = null;
  @observable public parentNodeUse: EditableTeachingPathNode | null = null;

  @observable public allGrades: Array<Grade> = [];
  @observable public allSubjects: Array<Subject> = [];
  @observable public allSources: Array<Source> = [];
  @observable public allKeywords: Array<Keyword> = [];
  @observable public allGoals: Array<GreepElements> = [];
  @observable public allArticlePanelFilters: FilterArticlePanel | null = null;
  @observable public isAssignmentCreating: boolean = false;

  @observable public isTagVisibleStore: boolean = false;

  public localeKey: string = EditEntityLocaleKeys.EDIT_TEACHING_PATH;

  public getArticlesWithDebounce = debounce(this.getArticles, DEBOUNCE_TIME);

  @action
  private buildTeachingPathContainer = (teachingPath: DraftTeachingPath, distribution?: Distribution) => {
    this.teachingPathContainer = new TeachingPathContainer({
      teachingPath,
      distribution
    });
  }

  @action
  public async getLocalesByid() {
    return this.teachingPathService.getLocalesByApi();
  }

  @action
  public resetTeachingPath() {
    this.teachingPathContainer = null;
  }

  public getUpdatedAt() {
    return this.currentEntity!.updatedAt;
  }

  public getPublishAt() {
    return this.currentEntity!.publishedAt;
  }

  @action
  public postSeletedArticle = (item: Article | null) => {
    this.selectedArticle = item;
  }

  public getSeletedArticle() {
    return this.selectedArticle;
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

  public getGoalsByArticle() {
    return '';
  }

  public returnIsEditAssignments() {
    return this.isEditAssignments;
  }

  public trueIsEditAssignments() {
    this.isEditAssignments = true;
  }

  public falseIsEditAssignments() {
    this.isEditAssignments = false;
  }

  public trueIsDraggable() {
    this.isDraggable = true;
  }

  public falseIsDraggable() {
    this.isDraggable = false;
  }

  public returnIsDraggable() {
    return this.isDraggable;
  }

  public returnIsEditArticles() {
    return this.isEditArticles;
  }

  public setEditNodeArticlesItem(value: boolean) {
    this.editNodeArticlesItem = value;
  }

  public setEditNodeAssigmentItem(value: boolean) {
    this.editNodeAssigmentItem = value;
  }

  public setNodeUse(node: EditableTeachingPathNode) {
    this.nodeUse = node;
  }

  public setParentNodeUse(node: EditableTeachingPathNode) {
    this.parentNodeUse = node;
  }

  public setOrientationNodeArticlesItem(orientation: string) {
    this.orientationNodeArticlesItem = orientation;
  }

  public trueIsEditArticles() {
    this.isEditArticles = true;
  }

  public setArticleInEdit(idArticle: number) {
    this.articleInEdit = idArticle;
  }

  public getArticleInEdit() {
    return this.articleInEdit;
  }

  public setAssignmentInEdit(idAssingment: number) {
    this.assingmentInEdit = idAssingment;
  }

  public getAssignmentInEdit() {
    return this.assingmentInEdit;
  }

  public falseIsEditArticles() {
    this.isEditArticles = false;
  }

  public returnIsEditDomain() {
    return this.isEditDomain;
  }

  public trueIsEditDomain() {
    this.isEditDomain = true;
  }

  public falseIsEditDomain() {
    this.isEditDomain = false;
  }

  @computed
  public get currentEntity() {
    return this.teachingPathContainer && this.teachingPathContainer.teachingPath;
  }

  @computed
  public get currentDistribution() {
    return this.teachingPathContainer && this.teachingPathContainer.distribution;
  }

  @computed
  public get ifSearchValueIsNumber() {
    return !isNaN(Number(this.searchValue.charAt(0)));
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

  public createTeachingPath = async () => {
    const teachingPath = await this.draftTeachingPathService.createTeachingPath();
    this.buildTeachingPathContainer(teachingPath);

    return this.currentEntity!;
  }

  public createTeachingPathLocale = async (id: number, localeid?: number) => {
    const teachingPath = await this.draftTeachingPathService.createTeachingPathLocale(id, localeid);
    this.buildTeachingPathContainer(teachingPath);

    return this.currentEntity!;
  }

  public getTeachingPathForEditing = async (id: number, localeid?: number) => {
    const teachingPath = await this.draftTeachingPathService.getDraftTeachingPathById(id, localeid);
    this.buildTeachingPathContainer(teachingPath);
    return toJS(this.currentEntity!);
  }

  public getArticleFromUsedOne = (id: number) => this.usedArticles.find(article => article.id === id);

  public getDraftForeignTeachingPath = async (id: number, isPreview?: boolean, localeid?: number) => {
    const data = await this.draftTeachingPathService.getDraftForeignTeachingPathById(id, isPreview, localeid);
    this.buildTeachingPathContainer(data.teachingPath);
    if (data.articles) {
      this.usedArticles = data.articles;
    }
    return this.currentEntity!;
  }

  public deleteTeachingPathById = async (id: number) => {
    await this.draftTeachingPathService.deleteTeachingPath(id);
  }

  public async getDistributionData(id: number) {
    const distribution = await this.distributionService.getTeachingPathDistributionData(id);
    this.buildTeachingPathContainer(this.currentEntity!, distribution);

    return toJS(this.teachingPathContainer);
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
        this.articlesList = isNextPage ? this.articlesList.concat(articles) : articles;
        if (articles.length < perPage) {
          this.isFetchedArticlesListFinished = true;
        }
      } catch (e) {
        if (e.response.status === error400) {
          return;
        }

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

  @action
  public setCurrentNode = (node: EditableTeachingPathNode | null) => {
    this.currentNode = node;
  }

  @action
  public setSelectedDragNode = (node: EditableTeachingPathNode | null) => {
    this.selectedDragNode = node;
  }

  @action
  public getSelectedDragNode = () => this.selectedDragNode

  @action
  public setParentSelectedDragNode = (node: EditableTeachingPathNode | null) => {
    this.selectedParentDragNode = node;
  }

  @action
  public getParentSelectedDragNode = () => this.selectedParentDragNode

  @action
  public addChildToCurrentNode = (node: EditableTeachingPathNode) => {
    const qqq = this.currentNode!.children
      .map(child => child.items!)
      .flat()
      .filter(item => item.value.id === node.items![0].value.id);
    if (!qqq.length) {
      this.currentNode!.setChildren([...this.currentNode!.children, node]);
    }
  }

  @action
  public addChildToCurrentNodeNullPerItem = (node: EditableTeachingPathNode) => {
    this.currentNode!.appEndChild(node);
  }

  @action
  public addChildrenByOrder = (node: EditableTeachingPathNode, search: EditableTeachingPathNode, order: string) => {
    this.currentNode!.addChildByOrder(node, search, order);
  }

  @action
  public removeChildToCurrentNodeNullPerItem = (node: EditableTeachingPathNode) => {
    this.currentNode!.removeChild(node);
  }

  public createNewNode = (
    valueOfItems: TeachingPathItemValue, type: TeachingPathNodeType
  ) => new EditableTeachingPathNode({
    type,
    items: [valueOfItems],
    children: [],
    draftTeachingPath: this.currentNode!.draftTeachingPath,
    selectQuestion: '',
    guidance: '',
    parentNode: this.currentNode!
  })

  @action
  public async save(): Promise<void> {
    this.showValidationErrors = true;
    reaction(() => this.currentEntity && this.currentEntity.isValid('save'), (isValid, reactionDisposer) => {
      if (isValid) {
        this.showValidationErrors = false;
        reactionDisposer.dispose();
      }
    });
    return this.currentEntity!.saveTeachingPath();
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

    return this.currentDistribution!.distributeTeachingPath();
  }

  @action
  public resetCurrentArticlesPage() {
    this.currentArticlesPage = 1;
  }

  @action
  public resetArticlesList() {
    this.articlesList = [];
  }

  public getIsDraftSaving(): boolean {
    return this.currentEntity!.getIsDraftSaving();
  }

  public async getFiltersArticlePanel(lang: string) {
    this.allArticlePanelFilters = await this.teachingPathService.getFiltersArticlePanel(lang);
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

  public async getKeywords() {
    /*
    this.allKeywords =  await this.assignmentService.getSources() [{ description: 'asdfadsfsd' }, { description: 'GAAAAAAAAA' }, { description: 'Skolerom' }, { description: 'My keyword' }];
    */
    const selectedArticlesIds = await this.currentEntity!.getAllSelectedArticlesIds();
    const selectedAssignmentIds = await this.currentEntity!.getAllSelectedAssignmentsIds();
    this.allKeywords = await this.draftTeachingPathService.getKeywordsFromArticles(selectedArticlesIds, selectedAssignmentIds);
    return this.allKeywords;
  }

  public async getAssignmentById(id: number): Promise<Assignment> {
    return this.assignmentService.getAssignmentById(id);
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

  public getAllKeywords(): Array<Keyword> {
    return toJS(this.allKeywords);
  }

  public getAllArticlePanelFilters() {
    return toJS(this.allArticlePanelFilters);
  }

  public clearTeachingPathContainer() {
    this.teachingPathContainer = null;
    this.showValidationErrors = false;
  }

  public getCurrentLocale() {
    return this.userService.getCurrentLocale() || Locales.EN;
  }

  public getCurrentUser() {
    return this.userService.getCurrentUser();
  }

  public getTeachingPathIdFromLocalStorage() {
    return this.userService.getAssignmentId();
  }

  public setAssignmentIdToLocalStorage(teachingPathId: string) {
    this.userService.setTeachingPathId(teachingPathId);
  }

  public getReferralToken() {
    return this.userService.getTeachingPathReferralToken();
  }

  public setReferralToken(referralToken: string) {
    this.userService.setTeachingPathReferralToken(referralToken);
  }

  public async assignStudentToTeachingPath(teachingPathId: string, referralToken: string) {
    return this.distributionService.assignStudentToTeachingPath(teachingPathId, referralToken);
  }

  @action
  public setIsAssignmentCreating = (isAssignmentCreating: boolean) => {
    this.isAssignmentCreating = isAssignmentCreating;
  }

  @action
  public async sendDataDomain(domain: string) {
    return this.teachingPathService.sendDataDomain(domain);
  }

  @action
  public async getGradeWpIds(gradeWpIds: Array<number>) {
    return this.teachingPathService.getGradeWpIds(gradeWpIds);
  }

  @action
  public async getSubjectWpIds(subjectWpIds: Array<number>) {
    return this.teachingPathService.getSubjectWpIds(subjectWpIds);
  }

  @action
  public async getGrepFilters(grades: string, subjects: string, coreElements?: string, goals?: string) {
    return this.teachingPathService.getGrepFilters(grades, subjects, coreElements, goals);
  }

  @action
  public async getGrepFiltersTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?: string, goals?: string, source?: string) {
    return this.teachingPathService.getGrepFiltersTeachingPath(locale, grades, subjects, coreElements, mainTopics, goals, source);
  }
  @action
  public async getGrepFiltersMyTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?: string, goals?: string, source?: string) {
    return this.teachingPathService.getGrepFiltersMyTeachingPath(locale, grades, subjects, coreElements, mainTopics, goals, source);
  }
  @action
  public async getGrepFiltersMyschoolTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?: string, goals?: string, source?: string) {
    return this.teachingPathService.getGrepFiltersMyschoolTeachingPath(locale, grades, subjects, coreElements, mainTopics, goals, source);
  }

  @action
  public async getGrepGoalsFilters(grepCoreElementsIds: Array<number>, grepMainTopicsIds: Array<number>, gradesIds: Array<number>, subjectsIds: Array<number>, orderGoalsCodes: Array<string>, perPage: number, page: number) {
    return this.teachingPathService.getGrepGoalsFilters(grepCoreElementsIds, grepMainTopicsIds, gradesIds, subjectsIds, orderGoalsCodes, perPage, page);
  }

  @action
  public async downloadTeacherGuidancePDF(id: number) {
    return this.teachingPathService.downloadTeacherGuidancePDF(id);
  }

}
