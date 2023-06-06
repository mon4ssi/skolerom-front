import { API } from 'utils/api';
import {
  ActiveAssignmentsDTO,
  ActiveTeachingPathsDTO,
  ActivityRepo,
  EvaluatedAnswersDTO,
  RecentActivityAction,
  SliderWidgetDomain,
  SliderWidgetDTO
} from './Activity';
import { Assignment, Filter } from '../assignment/Assignment';
import { TeachingPath } from '../teachingPath/TeachingPath';
import { buildNewestAssignments, buildNewestTeachingPaths, buildRecentActivity } from './factory';
import { buildFilterDTO } from '../assignment/factory';

export interface RecentActivityDTO {
  userName: string;
  taskType: string;
  taskId: number;
  taskName: string;
  action: RecentActivityAction;
  createdAt: string;
}

export class ActivityApi implements ActivityRepo {
  public async getActiveAssignments(): Promise<ActiveAssignmentsDTO> {
    return (await API.get('api/teacher/dashboard/active-assignments')).data;
  }

  public async getNewestTeachingPaths(filter: Filter): Promise<Array<TeachingPath>> {
    const response = await API.get('api/teacher/teaching-paths', {
      params: buildFilterDTO(filter)
    });
    return buildNewestTeachingPaths(response.data.data);
  }

  public async getNewestAssignments(filter: Filter): Promise<Array<Assignment>> {
    const response = await API.get('api/teacher/assignments', {
      params: buildFilterDTO(filter)
    });
    return buildNewestAssignments(response.data.data);
  }

  public async getActiveTeachingPaths(): Promise<ActiveTeachingPathsDTO> {
    return (await API.get('api/teacher/dashboard/active-teaching-paths')).data;
  }

  public async getEvaluatedAnswers(): Promise<EvaluatedAnswersDTO> {
    return (await API.get('api/teacher/dashboard/active-answers')).data;
  }

  public async getSlider(role: string): Promise<SliderWidgetDomain> {
    const sliderData: Array<SliderWidgetDTO> = (await API.get(`${process.env.REACT_APP_WP_URL}/wp-json/getbanners/v1/post/?role=${role}`)).data;

    return new SliderWidgetDomain(sliderData);
  }

  public async getIframeContent(): Promise<String> {
    const url = (await API.get(`${process.env.REACT_APP_WP_URL}/wp-json/mainapp/v1/details`)).data.data.url;
    return url;
  }

  public async getRecentActivity() {
    const response = await API.get('api/teacher/dashboard/task-activity');

    return response.data.data.map(buildRecentActivity);
  }
}
