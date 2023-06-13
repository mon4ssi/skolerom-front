import {
  ActiveAssignmentsDTO,
  ActiveTeachingPathsDTO,
  ACTIVITY_REPO_KEY,
  ActivityRepo, EvaluatedAnswersDTO,
  SliderWidgetDomain,
  StatisticWidgetDomain
} from './Activity';
import { injector } from 'Injector';
import { Assignment, Filter } from '../assignment/Assignment';
import { TeachingPath } from '../teachingPath/TeachingPath';

export const ACTIVITY_SERVICE_KEY = 'ACTIVITY_SERVICE_KEY';

export class ActivityService {
  protected activityRepo: ActivityRepo = injector.get<ActivityRepo>(ACTIVITY_REPO_KEY);

  public async getSlider(role: string): Promise<SliderWidgetDomain> {
    return this.activityRepo.getSlider(role);
  }

  public async getIframeContent(): Promise<String> {
    return this.activityRepo.getIframeContent();
  }

  public async getNewestAssignments(filter: Filter): Promise<Array<Assignment>> {
    return this.activityRepo.getNewestAssignments(filter);
  }

  public async getNewestTeachingPaths(filter: Filter): Promise<Array<TeachingPath>> {
    return this.activityRepo.getNewestTeachingPaths(filter);
  }

  public async getStatistics(): Promise<StatisticWidgetDomain> {
    const activeAssignments: ActiveAssignmentsDTO = await this.activityRepo.getActiveAssignments();
    const activeTeachingPaths: ActiveTeachingPathsDTO = await this.activityRepo.getActiveTeachingPaths();
    const evaluatedAnswers: EvaluatedAnswersDTO = await this.activityRepo.getEvaluatedAnswers();

    return new StatisticWidgetDomain(activeAssignments, activeTeachingPaths, evaluatedAnswers);
  }

  public async getRecentActivity() {
    return this.activityRepo.getRecentActivity();
  }
}
