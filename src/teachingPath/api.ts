import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';
import intl from 'react-intl-universal';
import { injector } from 'Injector';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { Locales } from 'utils/enums';

import { TeachingPath, TeachingPathItem, TeachingPathNode, TeachingPathNodeType, TeachingPathRepo } from './TeachingPath';
import { Article, Filter, Grade, Domain, FilterGrep, GoalsData, Attachment, LenguajesB } from 'assignment/Assignment';
import { API } from '../utils/api';
import { parseQueryString } from 'utils/queryString';
import { buildFilterDTO, GradeDTO } from 'assignment/factory';
import { Breadcrumbs } from './teachingPathDraft/TeachingPathDraft';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { StudentTeachingPathEvaluationNodeItem } from 'evaluation/api';
import { CONDITIONALERROR, STATUS_SERVER_ERROR, STATUS_BADREQUEST, STATUS_SERVERBADREQUEST } from 'utils/constants';

export interface AttachmentDTO {
  id: number;
  url: string;
  alt: string;
  file_name: string;
  title: string;
  duration?: number;
  src?: Array<string>;
  source?: string;
}

export interface TeachingPathNodeItemResponseDTO {
  id: number;
  wpId: number;
  title: string;
  description?: string;
  excerpt?: string;
  grades: Array<Grade>;
  url?: string;
  images?: { id: number, url: string };
  relatedArticles?: Array<Article>;
  isSelected?: boolean;
  hasGuidance?: boolean;
  open?: boolean;
  numberOfQuestions?: number;
  numberOfArticles?: number;
}

export interface TeachingPathNodeResponseDTO {
  id?: number;
  type: TeachingPathNodeType;
  selectQuestion: string | null;
  guidance: string | null;
  items: Array<TeachingPathNodeItemResponseDTO>;
  children: Array<TeachingPathNodeResponseDTO>;
}

export interface StudentTeachingPathNodeResponseDTO extends TeachingPathNodeResponseDTO {
  items: Array<StudentTeachingPathEvaluationNodeItem>;
  children: Array<StudentTeachingPathNodeResponseDTO>;
}

export interface TeacherTeachingPathResponseDTO {
  id: number;
  author: string;
  title: string;
  description: string;
  view: string;
  grades: Array<GradeDTO> | null;
  levels: Array<number>;
  featuredImage?: string;
  url?: string;
  isPublished?: boolean;
  isDistributed?: boolean;
  hasGuidance?: boolean;
  isMySchool?: boolean;
  canEditOrDelete?: boolean;
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
  public numberContentAll = 0;
  public arrayNumberContentAll: Array<number> = [];

  public async getAllTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
    const response = await API.get('api/teacher/teaching-paths', {
      params: buildFilterDTO(filter)
    });
    return {
      teachingPathsList: response.data.data.map((item: TeacherTeachingPathResponseDTO) => new TeachingPath({
        id: item.id,
        author: item.author,
        title: item.title,
        description: item.description,
        grades: isNil(item.grades) ? undefined : item.grades.map(grade => new Grade(grade.id, grade.title)),
        view: item.view,
        levels: item.levels,
        featuredImage: item.featuredImage,
        url: item.url,
        isPublished: item.isPublished,
        isDistributed: item.isDistributed,
        hasGuidance: item.hasGuidance,
        canEditOrDelete: item.canEditOrDelete
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getMySchoolTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
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
        isDistributed: item.isDistributed,
        isMySchool: item.isMySchool,
        canEditOrDelete: item.canEditOrDelete
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getInReviewTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
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
        isDistributed: item.isDistributed,
        isMySchool: item.isMySchool,
        canEditOrDelete: item.canEditOrDelete
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getMyTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
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
        isDistributed: item.isDistributed,
        hasGuidance: item.hasGuidance,
        canEditOrDelete: item.canEditOrDelete
      })),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getStudentTeachingPathsList(filter: Filter): Promise<{ teachingPathsList: Array<TeachingPath>; total_pages: number; }> {
    if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
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

  public async getTeachingPathDataById(id: number): Promise<TeachingPath> {
    try {
      /* tslint:disable:no-string-literal */
      const search = parseQueryString(window.location.search)['locale_id'];
      /* tslint:enable:no-string-literal */
      const { data } = search ? await API.get(`api/teacher/teaching-paths/${id}?localeId=${Number(search)}`) : await API.get(`api/teacher/teaching-paths/${id}`);
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
        authorRole: data.authorRole,
        levels: data.levels,
        answerId: data.answerId,
        isCopy: data.isCopy,
        subjects: data.subjects,
        createdAt: data.created_at,

        // TEM-2319 Preview fot Teaching Paths
        subjectItems: data.subjects,
        coreElementItems: data.coreElements,
        multiSubjectItems: data.mainTopics,
        sourceItems: data.sources,
        goalsItems: data.goals,
        isMySchool: data.isMySchool,
        grepGoals: data.goals,
        numberOfArticles: data.numberOfArticles,
        numberOfQuestions: data.numberOfQuestion,
        hasGuidance: data.hasGuidance,
        isPublished: data.isPublished,
        ownedByMe: data.ownedByMe,
        translations: data.translations,
        isTranslations: data.isTranslations,
        originalLocaleId: data.originalLocaleId
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

  public async getLocalesByApi(): Promise<Array<LenguajesB>> {
    try {
      const response = await API.get('/api/locales');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  public async getTeachingPathByIdTeacher(id: number): Promise<TeachingPath> {
    try {
      /* tslint:disable:no-string-literal */
      const search = parseQueryString(window.location.search)['locale_id'];
      /* tslint:enable:no-string-literal */
      const { data } = search ? await API.get(`api/teacher/teaching-paths/${id}`, {
        params: {
          withBackground: true,
          localeId: Number(search)
        }
      }) : await API.get(`api/teacher/teaching-paths/${id}`, {
        params: {
          withBackground: true
        }
      });
      return new TeachingPath({
        id: data.id,
        title: data.title,
        description: data.description,
        isPrivate: data.isPrivate,
        isFinished: data.isFinished,
        rootNodeId: data.content.id,
        lastSelectedNodeId: data.lastSelectedNodeId,
        featuredImage: data.featuredImage,
        backgroundImage: data.backgroundImage,
        minNumberOfSteps: data.minNumberOfSteps,
        maxNumberOfSteps: data.maxNumberOfSteps,
        author: data.author,
        levels: data.levels,
        answerId: data.answerId,
        isCopy: data.isCopy,
        deadline: data.deadline,
        authorAvatar: data.authorPhoto
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
        featuredImage: data.featuredImage,
        backgroundImage: data.backgroundImage,
        minNumberOfSteps: data.minNumberOfSteps,
        maxNumberOfSteps: data.maxNumberOfSteps,
        author: data.author,
        levels: data.levels,
        answerId: data.answerId,
        isCopy: data.isCopy,
        deadline: data.deadline,
        authorAvatar: data.authorPhoto
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

  public searchShortesPath(data: any): number | undefined {
    const numberContent = 0;
    if (data.shortestPath !== undefined || data.shortestPath !== null || data.shortestPath.length !== 0 || typeof(data.shortestPath) !== 'undefined') {
      this.numberContentAll = this.numberContentAll + 1;
      if (typeof(data.shortestPath) !== 'undefined') {
        this.arrayNumberContentAll.push(data.shortestPath.id);
        this.searchShortesPath(data.shortestPath);
      }
    } else {
      return numberContent;
    }
  }

  public async getCurrentNodePreview(teachingPathId: number, nodeId: number): Promise<TeachingPathNode> {
    const { data } = await API.get(`api/teacher/teaching-paths/${teachingPathId}/node/${nodeId}`);
    this.arrayNumberContentAll = [];
    if (!isNull(data.shortestPath)) {
      // this.arrayNumberContentAll.push(data.shortestPath.id);
      // this.searchShortesPath(data.shortestPath);
    }
    const breadcrumbs = undefined;
    return new TeachingPathNode({ ...data, breadcrumbs });
  }

  public async getCurrentNode(teachingPathId: number, nodeId: number): Promise<TeachingPathNode> {
    const { data } = await API.get(`api/student/teaching-paths/${teachingPathId}/node/${nodeId}`);
    this.arrayNumberContentAll = [];
    if (!isNull(data.shortestPath)) {
      this.arrayNumberContentAll.push(data.shortestPath.id);
      this.searchShortesPath(data.shortestPath);
    }
    const breadcrumbs = data.breadcrumbs.reverse().map((crumb: BreadcrumbsResponseDTO) => new Breadcrumbs({
      selectQuestion: crumb.selectQuestion,
      id: crumb.id,
      parentNodeId: crumb.parentNodeId,
      shortest: this.numberContentAll,
      shortpathid: this.arrayNumberContentAll,
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
      if (error.response.status === STATUS_SERVER_ERROR || error.response.status === STATUS_BADREQUEST || error.response.status === STATUS_SERVERBADREQUEST) {
        if (error.response.data.message.code === CONDITIONALERROR) {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get('teaching path passing.external_error')
          });
        } else {
          if (error.response.data.message.code) {
            Notification.create({
              type: NotificationTypes.ERROR,
              title: intl.get(`teaching path passing.errortype_${error.response.data.message.code}`)
            });
          } else {
            Notification.create({
              type: NotificationTypes.ERROR,
              title: intl.get('teaching path passing.errortype_422')
            });
          }
        }
      }
      throw error;
    }
  }

  public async getFiltersArticlePanel(lang: string) {
    let langParmeter = lang;
    if (lang === '' || (typeof(lang) === 'undefined')) langParmeter = this.storageInteractor.getArticlesLocaleId()!;

    const response = await API.get(`${process.env.REACT_APP_WP_URL}/wp-json/filterarticlepanel/v1/get/`, {
      params:
      {
        lang: langParmeter,
        lc: this.storageInteractor.getArticlesLocaleId()
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

  public async getGrepFiltersTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals?: string, source?:string): Promise<FilterGrep>  {
    const response = await API.get('api/teacher/teaching-paths/grep/filters', {
      params: {
        locale,
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
  public async getGrepFiltersMyTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals?: string, source?:string): Promise<FilterGrep>  {
    const response = await API.get('api/teacher/teaching-paths/draft/grep/filters', {
      params: {
        locale,
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
  public async getGrepFiltersMyschoolTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals?: string, source?:string): Promise<FilterGrep>  {
    const response = await API.get('api/teacher/teaching-paths/myschool/grep/filters', {
      params: {
        locale,
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

  public async fetchImages(postIds: Array<number>): Promise<Array<Attachment>> {
    return (
      await API.get(
        `${process.env.REACT_APP_WP_URL}/wp-json/media/v1/post/`, {
          params: {
            id: postIds.join(','),
            content: 'img',
            size: 'full'
          },
        }
      )
    ).data.media.map((item: AttachmentDTO) => new Attachment(item.id, item.url, item.alt, item.file_name, item.title, item.url, item.duration!, item.src, item.source));
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

  public async getGradeWpIds(gradeWpIds: Array<number>): Promise<Array<Grade>> {
    const response = await API.get('/api/teacher/classes/lang', {
      params:
      {
        gradeWpIds
      }
    });
    return response.data.data;
  }

  public async getSubjectWpIds(subjectWpIds: Array<number>): Promise<Array<Grade>> {
    const response = await API.get('/api/teacher/subjects/lang', {
      params:
      {
        subjectWpIds
      }
    });
    return response.data.data;
  }

  public async finishTeachingPath(id: number): Promise<void> {
    await API.get(`api/student/teaching-paths/${id}/finish`);
  }

  public async deleteTeachingPathAnswers(teachingPathId: number, answerId: number): Promise<void> {
    await API.delete(`api/student/teaching-paths/${teachingPathId}/answer/${answerId}`);
  }

  public async deleteTeachingTranslation(teachingPathId: number, localeId: number): Promise<void> {
    await API.delete(`/api/teacher/teaching-paths/${teachingPathId}/destroy-translation?localeId=${localeId}`);
  }

  public async copyTeachingPath(id: number, all?: boolean): Promise<number> {
    if (all) {
      try {
        const response = await API.get(`api/teacher/teaching-paths/${id}/copy/identical`);
        return response.data.id;
      } catch (e) {
        throw new Error(`copy assignment ${e}`);
      }
    }
    try {
      const response = await API.get(`api/teacher/teaching-paths/${id}/copy`);
      return response.data.id;
    } catch (e) {
      throw new Error(`copy assignment ${e}`);
    }
  }

  public async copyTeachingPathByLocale(id: number, localeid?: number, all?: boolean): Promise<number> {
    if (all) {
      try {
        const response = await API.get(`api/teacher/teaching-paths/${id}/copy/identical?localeId=${localeid}`);
        return response.data.id;
      } catch (e) {
        throw new Error(`copy assignment ${e}`);
      }
    }
    try {
      const response = await API.get(`api/teacher/teaching-paths/${id}/copy?localeId=${localeid}`);
      return response.data.id;
    } catch (e) {
      throw new Error(`copy assignment ${e}`);
    }
  }

  public async downloadTeacherGuidancePDF(id: number): Promise<void> {
    try {
      /* tslint:disable:no-string-literal */
      const search = parseQueryString(window.location.search)['locale_id'];
      /* tslint:enable:no-string-literal */
      const response = search ? await API.get(`api/teacher/teaching-paths/${id}/guidance/download?localeId=${Number(search)}`, {
        responseType: 'blob',
        headers: { Accept: 'application/octet-stream' },
      }) : await API.get(`api/teacher/teaching-paths/${id}/guidance/download`, {
        responseType: 'blob',
        headers: { Accept: 'application/octet-stream' },
      });

      const blob = new Blob([response.data], { type: 'text/plain' });
      const a = document.createElement('a');
      a.download = 'TeachingPath-Guidance.pdf';
      a.href = window.URL.createObjectURL(blob);
      const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      a.dispatchEvent(clickEvt);
      a.remove();
    } catch (e) {
      throw new Error(`download Teaching Path Guidance pdf ${e}`);
    }
  }
}
