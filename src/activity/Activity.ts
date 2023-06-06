import flatMap from 'lodash/flatMap';
import { observable, computed } from 'mobx';

import { SLIDER_WIDGET_ZOOM_OUT_ANIMATION_KEY, SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE } from 'utils/constants';
import { SliderButtonBehavior } from 'utils/enums';
import { Assignment, Filter } from '../assignment/Assignment';
import { TeachingPath } from '../teachingPath/TeachingPath';
import { ACTIVITY_SERVICE_KEY, ActivityService } from './service';
import { injector } from '../Injector';

export interface SlideDTO {
  slide_image: string;
  slide_text: string;
  background_opacity: string;
  background: string;
  animation_time: string;
  animation: string;
  button_text: string;
  button: string;
  button_behavior: string;
  title: string;
}

export interface SliderWidgetDTO {
  id: string;
  slide: Array<SlideDTO>;
}

export interface ActiveAssignmentsDTO {
  activeAssignments: number;
}

export interface ActiveTeachingPathsDTO {
  activeTeachingPaths: number;
}

export interface EvaluatedAnswersDTO {
  activeAnswers: number;
}

export class SliderWidgetDomain {
  public readonly slides: Array<Slide>;

  constructor(sliderList: Array<SliderWidgetDTO>) {
    this.slides = flatMap(sliderList.map(slider => slider.slide.map(slide => new Slide(slide))));
  }
}

const MILLISECONDS_MULTIPLIER = 1000;

export class Slide {
  public readonly title: string;
  public readonly description: string;
  public readonly buttonText: string;
  public readonly buttonURL: string;
  public readonly buttonBehavior: SliderButtonBehavior;
  public readonly imageURL: string;
  public readonly timeTilNextSlide: number; // milliseconds
  public readonly hasZoomOutAnimation: boolean;

  constructor(slide: SlideDTO) {
    this.title = slide.title;
    this.description = slide.slide_text;
    this.buttonText = slide.button_text;
    this.buttonURL = slide.button;
    this.imageURL = slide.slide_image;
    this.timeTilNextSlide = slide.animation_time
      ? Number(slide.animation_time) * MILLISECONDS_MULTIPLIER
      : SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE;
    this.hasZoomOutAnimation = SLIDER_WIDGET_ZOOM_OUT_ANIMATION_KEY === slide.animation;
    switch (slide.button_behavior) {
      case SliderButtonBehavior.CURRENT_TAB:
        this.buttonBehavior = SliderButtonBehavior.CURRENT_TAB;
        break;
      case SliderButtonBehavior.POPUP:
        this.buttonBehavior = SliderButtonBehavior.POPUP;
        break;
      case SliderButtonBehavior.NEW_TAB:
      default:
        this.buttonBehavior = SliderButtonBehavior.NEW_TAB;
        break;
    }
  }
}

export class StatisticWidgetDomain {
  public readonly activeAssignments: number;
  public readonly activeTeachingPaths: number;
  public readonly unevaluatedAnswers: number;

  constructor(assignments: ActiveAssignmentsDTO, teachingPaths: ActiveTeachingPathsDTO, answers: EvaluatedAnswersDTO) {
    this.activeAssignments = assignments.activeAssignments;
    this.activeTeachingPaths = teachingPaths.activeTeachingPaths;
    this.unevaluatedAnswers = answers.activeAnswers;
  }
}

export const ACTIVITY_REPO_KEY = 'ACTIVITY_REPO_KEY';

export interface ActivityRepo {
  getSlider(role: string): Promise<SliderWidgetDomain>;
  getNewestAssignments(filter: Filter): Promise<Array<Assignment>>;
  getNewestTeachingPaths(filter: Filter): Promise<Array<TeachingPath>>;
  getActiveAssignments(): Promise<ActiveAssignmentsDTO>;
  getActiveTeachingPaths(): Promise<ActiveTeachingPathsDTO>;
  getEvaluatedAnswers(): Promise<EvaluatedAnswersDTO>;
  getRecentActivity(): Promise<Array<RecentActivity>>;
  getIframeContent(): Promise<String>;
}

export enum RecentActivityAction {
  GIVE_ANSWER = 'give_answer',
  UPDATE_ANSWER = 'update_answer',
  PAST_DEADLINE = 'past_deadline'
}

interface RecentActivityArgs {
  userName: string;
  taskType: string;
  taskId: number;
  taskName: string;
  action: RecentActivityAction;
  createdAt: string;
}

export class RecentActivity {

  @observable protected _userName: string;
  @observable protected _taskType: string;
  @observable protected _taskId: number;
  @observable protected _taskName: string;
  @observable protected _action: RecentActivityAction;
  @observable protected _createdAt: string;

  constructor(args: RecentActivityArgs) {
    this._userName = args.userName;
    this._taskType = args.taskType;
    this._taskId = args.taskId;
    this._taskName = args.taskName;
    this._action = args.action;
    this._createdAt = args.createdAt;
  }

  @computed
  public get userName() {
    return this._userName;
  }

  @computed
  public get taskType() {
    return this._taskType;
  }

  @computed
  public get taskId() {
    return this._taskId;
  }

  @computed
  public get taskName() {
    return this._taskName;
  }

  @computed
  public get action() {
    return this._action;
  }

  @computed
  public get createdAt() {
    return this._createdAt;
  }
}

export class ActivityList {
  private activityService: ActivityService = injector.get(ACTIVITY_SERVICE_KEY);
  public filter: Filter = new Filter();

  public setFiltersPerPage = (perPage: number) => {
    this.filter.per_page = perPage;
  }

  public setFilterSorting(orderField: string, order: string) {
    this.filter.orderField = orderField;
    this.filter.order = order;
  }

  public async getNewestTeachingPaths() {
    return this.activityService.getNewestTeachingPaths(this.filter);
  }

  public async getNewestAssignments() {
    return this.activityService.getNewestAssignments(this.filter);
  }

  public async getStatistics() {
    return this.activityService.getStatistics();
  }

  public async getRecentActivity() {
    return this.activityService.getRecentActivity();
  }

  public async getSlider(role: string) {
    return this.activityService.getSlider(role);
  }

  public async getIframeContent() {
    return this.activityService.getIframeContent();
  }
}
