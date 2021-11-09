import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';
import intl from 'react-intl-universal';
import { injector } from 'Injector';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { Locales } from 'utils/enums';

import { TeachingPath, TeachingPathItem, TeachingPathNode, TeachingPathNodeType, TeachingPathRepo } from './TeachingPath';
import { Article, Filter, Grade, Domain, FilterGrep, GoalsData } from 'assignment/Assignment';
import { API } from '../utils/api';
import { buildFilterDTO, GradeDTO } from 'assignment/factory';
import { Breadcrumbs } from './teachingPathDraft/TeachingPathDraft';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { StudentTeachingPathEvaluationNodeItem } from 'evaluation/api';
import { CONDITIONALERROR, STATUS_SERVER_ERROR, STATUS_BADREQUEST } from 'utils/constants';

export interface TeachingPathNodeItemResponseDTO {
  id: number;
  wpId: number;
  title: string;
  description?: string;
  excerpt?: string;
  grades: Array<Grade>;
  url?: string;
  numberOfQuestions?: number;
  images?: { id: number, url: string };
  relatedArticles?: Array<Article>;
  isSelected?: boolean;
}

export interface TeachingPathNodeResponseDTO {
  id?: number;
  type: TeachingPathNodeType;
  selectQuestion: string | null;
  items: Array<TeachingPathNodeItemResponseDTO>;
  children: Array<TeachingPathNodeResponseDTO>;
}

export interface StudentTeachingPathNodeResponseDTO extends TeachingPathNodeResponseDTO {
  items: Array<StudentTeachingPathEvaluationNodeItem>;
  children: Array<StudentTeachingPathNodeResponseDTO>;
}

export interface TeacherTeachingPathResponseDTO {
  id: number;
  title: string;
  description: string;
  view: string;
  grades: Array<GradeDTO> | null;
  levels: Array<number>;
  featuredImage?: string;
  url?: string;
  isPublished?: boolean;
  isDistributed?: boolean;
}

export interface StudentTeachingPathResponseDTO extends TeacherTeachingPathResponseDTO {
  answerId: number;
  author: string;
  comment?: string;
  isAnswered: boolean;
  isPassed: boolean | null;
  mark: number | null;
  numberOfPaths: number;
  status: boolean | null;
  endDate: Date;
}

export interface BreadcrumbsResponseDTO {
  id: number;
  items: Array<TeachingPathNodeItemResponseDTO> | null;
  selectQuestion: string;
  type: TeachingPathNodeType;
  parentNodeId: number | null;
}

export class TeachingPathApi implements TeachingPathRepo {

  public storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  public currentLocale = this.storageInteractor.getCurrentLocale()!;

  public async getAllTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    const response = await API.get('api/teacher/teaching-paths', {
      params: buildFilterDTO(filter)
    });
    return {
      teachingPathsList: response.data.data.map((item: TeacherTeachingPathResponseDTO) => new TeachingPath({
        id: item.id,
        title: item.title,
        description: item.description,
        grades: isNil(item.grades) ? undefined : item.grades.map(grade => new Grade(grade.id, grade.title)),
        view: item.view,
        levels: item.levels,
        featuredImage: item.featuredImage,
        url: item.url,
        isPublished: item.isPublished,
        isDistributed: item.isDistributed
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getMyTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    const response = await API.get('api/teacher/teaching-paths/draft', {
      params: buildFilterDTO(filter)
    });
    return {
      teachingPathsList: response.data.data.map((item: TeacherTeachingPathResponseDTO) => new TeachingPath({
        id: item.id,
        title: item.title,
        description: item.description,
        grades: isNil(item.grades) ? undefined : item.grades.map(grade => new Grade(grade.id, grade.title)),
        levels: item.levels,
        featuredImage: item.featuredImage,
        url: item.url,
        isPublished: item.isPublished,
        isDistributed: item.isDistributed
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getStudentTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    const response = await API.get('api/student/teaching-paths', {
      params: buildFilterDTO(filter)
    });
    return {
      teachingPathsList: response.data.data.map((item: StudentTeachingPathResponseDTO) => new TeachingPath({
        id: item.id,
        answerId: item.answerId,
        title: item.title,
        description: item.description,
        grades: isNil(item.grades) ? undefined : item.grades.map(grade => new Grade(grade.id, grade.title)),
        levels: item.levels,
        featuredImage: item.featuredImage,
        author: item.author,
        comment: item.comment,
        isAnswered: item.isAnswered,
        isPassed: item.isPassed,
        mark: item.mark,
        maxNumberOfSteps: item.numberOfPaths,
        status: item.status,
        deadline: item.endDate
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getTeachingPathById(id: number): Promise<TeachingPath> {
    try {
      const { data } = await API.get(`api/student/teaching-paths/${id}`);
      return new TeachingPath({
        id: data.id,
        title: data.title,
        description: data.description,
        isPrivate: data.isPrivate,
        isFinished: data.isFinished,
        rootNodeId: data.rootNodeId,
        lastSelectedNodeId: data.lastSelectedNodeId,
        minNumberOfSteps: data.minNumberOfSteps,
        maxNumberOfSteps: data.maxNumberOfSteps,
        author: data.author,
        levels: data.levels,
        answerId: data.answerId,
        isCopy: data.isCopy,
      });
    } catch (error) {
      if (error.response.data.message === 'Teaching path not assigned to you') {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('teaching path passing.not for you')
        });
      } else if (error.response.data.message === 'Teaching path deadline passed') {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('teaching path passing.validation.deadline')
        });
      }
      throw error;
    }

  }

  public async getCurrentNode(teachingPathId: number, nodeId: number): Promise<TeachingPathNode> {
    const { data } = await API.get(`api/student/teaching-paths/${teachingPathId}/node/${nodeId}`);

    const breadcrumbs = data.breadcrumbs.reverse().map((crumb: BreadcrumbsResponseDTO) => new Breadcrumbs({
      selectQuestion: crumb.selectQuestion,
      id: crumb.id,
      parentNodeId: crumb.parentNodeId,
      items: !isNull(crumb.items) ? crumb.items.map(item => new TeachingPathItem({
        type: crumb.type,
        value: item
      })) : undefined
    }));
    return new TeachingPathNode({ ...data, breadcrumbs });
  }

  public async markAsPickedArticle(teachingPathId: number, nodeId: number, idArticle: number, graduation: number): Promise<void> {
    await API.post(`api/student/teaching-paths/${teachingPathId}/node/${nodeId}/article/${idArticle}/mark`, { graduation });
  }

  public async sendDataDomain(url: string): Promise<Domain> {
    try {
      const { data } = await API.post('api/teacher/teaching-paths/domain', { url });
      return new Domain({
        id: data.id,
        title: data.title,
        description: data.description,
        url: `${url}`,
        featuredImage: data.image
      });
    } catch (error) {
      if (error.response.status === STATUS_SERVER_ERROR || error.response.status === STATUS_BADREQUEST) {
        if (error.response.data.message.code === CONDITIONALERROR) {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get('teaching path passing.external_error')
          });
        } else {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get(`teaching path passing.errortype_${error.response.data.message.code}`)
          });
        }
      }
      throw error;
    }
  }

  public async getFiltersArticlePanel() {
    const response = await API.get(`${process.env.REACT_APP_WP_URL}/wp-json/filterarticlepanel/v1/get/`, {
      params:
      {
        lang: this.currentLocale !== Locales.EN ? this.storageInteractor.getArticlesLocaleId() : null
      }
    });
    return response.data;
  }

  public async getTeachingPathDistributes(filter: Filter): Promise<{
    teachingPathsList: Array<TeachingPath>,
    total_pages: number;
  }> {
    const response = (await API.get('api/teacher/teaching-paths/distributes', { params: filter })).data;
    return {
      teachingPathsList: response.data,
      total_pages: response.meta.pagination.total_pages,
    };
  }

  public async getGrepFiltersTeachingPath(grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals?: string, source?:string): Promise<FilterGrep>  {
    const response = await API.get('api/teacher/teaching-paths/grep/filters', {
      params: {
        grades,
        subjects,
        coreElements,
        mainTopics,
        goals,
        source
      }
    });
    return response.data;
  }

  public async getGrepFilters(grades: string, subjects: string, coreElements?: string, goals?: string): Promise<FilterGrep>  {
    const response = await API.get('api/teacher/grep/filters', {
      params: {
        grades,
        subjects,
        coreElements,
        goals
      }
    });
    return response.data;
  }
  /* tslint:disable-next-line:max-line-length */
  public async getGrepGoalsFilters(grepCoreElementsIds: Array<number>, grepMainTopicsIds: Array<number>, gradesIds: Array<number>, subjectsIds: Array<number>, orderGoalsCodes: Array<string>, perPage: number, page: number): Promise<{ data: Array<GoalsData>; total_pages: number; }> {
    const response = await API.get('api/teacher/teaching-paths/grep/goals', {
      params: {
        grepCoreElementsIds,
        grepMainTopicsIds,
        gradesIds,
        subjectsIds,
        orderGoalsCodes,
        page,
        per_page: perPage
      }
    });
    return {
      data: response.data.data,
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getTeachingPathListOfStudentInList(studentId: number, filter: Filter) {
    try {
      const response = await API.get('api/teacher/students/teaching-paths', {
        params: {
          studentId,
          ...buildFilterDTO(filter)
        }
      });
      return {
        teachingPathsList: response.data.data,
        total_pages: response.data.meta.pagination.total_pages
      };
    } catch {
      return {
        teachingPathsList: [],
        total_pages: 0
      };
    }
  }

  public async finishTeachingPath(id: number): Promise<void> {
    await API.get(`api/student/teaching-paths/${id}/finish`);
  }

  public async deleteTeachingPathAnswers(teachingPathId: number, answerId: number): Promise<void> {
    await API.delete(`api/student/teaching-paths/${teachingPathId}/answer/${answerId}`);
  }

  public async copyTeachingPath(id: number): Promise<number> {
    try {
      const response = await API.get(`api/teacher/teaching-paths/${id}/copy`);

      return response.data.id;
    } catch (e) {
      throw new Error(`copy assignment ${e}`);
    }
  }

}
