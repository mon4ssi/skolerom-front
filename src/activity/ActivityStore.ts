import { action, computed, observable } from 'mobx';

import { injector } from 'Injector';

import { ActivityList, RecentActivity, SliderWidgetDomain, StatisticWidgetDomain, ActivityRepo, ACTIVITY_REPO_KEY } from './Activity';
import { SortingFilter, StoreState } from 'utils/enums';
import { Article, Assignment, ARTICLE_SERVICE_KEY } from '../assignment/Assignment';
import { ArticleService } from 'assignment/service';
import { TeachingPath } from '../teachingPath/TeachingPath';
import { UserType } from 'user/User';
import { ACTIVITY_SERVICE_KEY, ActivityService } from './service';

const assignmentsAmount = 4;

type SliderWidgetMap = {
  [UserType.Student]?: SliderWidgetDomain;
  [UserType.Teacher]?: SliderWidgetDomain;
};

type SliderWidgetStateMap = {
  [UserType.Student]: StoreState;
  [UserType.Teacher]: StoreState;
};

const UserTypeToSliderWidgetQSProp = {
  [UserType.Student]: 'student',
  [UserType.Teacher]: 'teacher',
};

export class ActivityStore {

  private activityList = new ActivityList();
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);
  private activityService: ActivityService = injector.get(ACTIVITY_SERVICE_KEY);

  @observable private _sliderWidgetMap: SliderWidgetMap = {};
  @observable private _urliframe: String = '';
  @observable private _statisticWidget?: StatisticWidgetDomain;
  @observable private _sliderWidgetState: SliderWidgetStateMap = {
    [UserType.Student]: StoreState.PENDING,
    [UserType.Teacher]: StoreState.PENDING,
  };
  @observable private _statisticWidgetState: StoreState = StoreState.PENDING;

  public get statisticWidget() {
    return this._statisticWidget;
  }

  public get statisticWidgetState() {
    return this._statisticWidgetState;
  }

  @observable public _newestTeachingPathState: StoreState = StoreState.PENDING;
  @observable public _newestArticlesState: StoreState = StoreState.PENDING;
  @observable public _newestAssignmentsState: StoreState = StoreState.PENDING;
  @observable public _newestArticles: Array<Article> = [];
  @observable public _newestAssignments: Array<Assignment> = [];
  @observable public _newestTeachingPaths: Array<TeachingPath> = [];

  @observable public recentActivityState: StoreState = StoreState.PENDING;
  @observable public recentActivityList: Array<RecentActivity> = [];

  @computed
  public get newestArticles() {
    return this._newestArticles;
  }

  @computed
  public get newestTeachingPaths() {
    return this._newestTeachingPaths;
  }

  @computed
  public get newestAssignments() {
    return this._newestAssignments;
  }

  @computed
  public get newestArticlesState() {
    return this._newestArticlesState;
  }

  @computed
  public get newestAssignmentsState() {
    return this._newestAssignmentsState;
  }

  @computed
  public get urliframe() {
    return this._urliframe;
  }

  @computed
  public get newestTeachingPathState() {
    return this._newestTeachingPathState;
  }
  public getSliderWidget(role: UserType.Teacher | UserType.Student): SliderWidgetDomain | undefined {
    return this._sliderWidgetMap[role];
  }

  public getSliderWidgetState(role: UserType.Teacher | UserType.Student): StoreState {
    return this._sliderWidgetState[role];
  }

  @action
  public resetNewestArticles = () => {
    this._newestArticles = [];
  }

  @action
  public resetNewestAssignments = () => {
    this._newestAssignments = [];
  }

  @action
  public resetNewestTeachingPaths = () => {
    this._newestTeachingPaths = [];
  }

  @action
  public getIframeContent = async () => {
    const url = await this.activityList.getIframeContent();
    this._urliframe = url;
  }

  @action
  public loadNewestTeachingPaths = async () => {
    this._newestTeachingPathState = StoreState.LOADING;
    try {
      this.activityList.setFiltersPerPage(assignmentsAmount);
      this.activityList.setFilterSorting(SortingFilter.CREATION_DATE, SortingFilter.DESC);
      this._newestTeachingPaths = await this.activityList.getNewestTeachingPaths();
      this._newestTeachingPathState = StoreState.PENDING;
    } catch (e) {
      this._newestTeachingPathState = StoreState.ERROR;
    }
  }

  @action
  public loadNewestArticles = async (amount: number) => {
    this._newestArticlesState = StoreState.LOADING;
    try {
      this._newestArticles = await this.articleService.getArticles({
        perPage: amount,
        page: 1
      });
      this._newestArticlesState = StoreState.PENDING;
    } catch (e) {
      this._newestArticlesState = StoreState.ERROR;
    }
  }

  @action
  public loadNewestAssignments = async () => {
    this._newestAssignmentsState = StoreState.LOADING;
    try {
      this.activityList.setFiltersPerPage(assignmentsAmount);
      this.activityList.setFilterSorting(SortingFilter.CREATION_DATE, SortingFilter.DESC);
      this._newestAssignments = await this.activityList.getNewestAssignments();
      this._newestAssignmentsState = StoreState.PENDING;
    } catch (e) {
      this._newestAssignmentsState = StoreState.ERROR;
    }
  }

  @action
  public loadSliderWidget = async (role: UserType.Student | UserType.Teacher) => {
    this._sliderWidgetState[role] = StoreState.LOADING;
    try {
      this._sliderWidgetMap[role] = await this.activityList.getSlider(UserTypeToSliderWidgetQSProp[role]);
      this._sliderWidgetState[role] = StoreState.PENDING;
    } catch (e) {
      this._sliderWidgetState[role] = StoreState.ERROR;
    }
  }

  @action
  public loadStatisticWidget = async () => {
    this._statisticWidgetState = StoreState.LOADING;
    try {
      this._statisticWidget = await this.activityList.getStatistics();
      this._statisticWidgetState = StoreState.PENDING;
    } catch (e) {
      this._statisticWidgetState = StoreState.ERROR;
    }
  }

  @action
  public loadRecentActivity = async () => {
    this.recentActivityState = StoreState.LOADING;
    try {
      this.recentActivityList = await this.activityList.getRecentActivity();
      this.recentActivityState = StoreState.PENDING;
    } catch (e) {
      this.recentActivityState = StoreState.ERROR;
    }
  }
}
