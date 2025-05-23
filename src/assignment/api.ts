import { injector } from 'Injector';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { API } from 'utils/api';
import {
  Article,
  ArticleRepo,
  Assignment,
  AssignmentDistribute,
  AssignmentRepo,
  Attachment,
  Filter,
  Grade,
  QuestionAttachment,
  Subject,
  WPLocale,
  Source,
  FilterGrep,
  GoalsData,
  GenericGrepItem,
  CustomImgAttachment,
  LenguajesB,
  Translations
} from './Assignment';
import {
  AssignmentDistributeDTO,
  buildAllAssignmentsList,
  buildArticle,
  buildAttachment,
  buildFilterDTO,
  buildMyAssignmentsList,
  buildStudentAssignmentList,
  GradeDTO,
  SubjectDTO,
  GreepElements,
  SourceDTO
} from './factory';
import { DEFAULT_AMOUNT_ARTICLES_PER_PAGE, DEFAULT_CUSTOM_IMAGES_PER_PAGE, LOCALES_MAPPING_FOR_BACKEND } from 'utils/constants';
import { ContentBlockType } from './ContentBlock';
import { Locales } from 'utils/enums';
import { parseQueryString } from 'utils/queryString';
import { CustomImage } from './view/NewAssignment/AttachmentsList/CustomImageForm/CustomImageForm';
import { CustomImageAttachments } from './view/NewAssignment/AttachmentsList/Attachments/CustomImageAttachments';
import isNil from 'lodash/isNil';

export interface AttachmentDTO {
  id: number;
  url: string;
  alt: string;
  file_name: string;
  title: string;
  url_large?: string;
  duration?: number;
  src?: Array<string>;
  source?: string;
}

export interface CustomImgAttachmentDTO {
  path: string;
  title: string;
  id?: number;
  filename?: string;
  source?: string;
  deletedAt?: string | undefined | null;
}

export interface CustomImgAttachmentResponse {
  id: number;
  image_url: string;
  source: string;
  title: string;
}

export interface ImageArticleDTO {
  img_id: number;
  img_url: string;
  img_url_large?: string;
}

export interface StudentLevelDTO {
  term_id: number;
  name: string;
  slug: string;
  childArticles?: Array<ArticleDTO>;
}

export interface ArticleDTO {
  id: number;
  title: string;
  link: string;
  excerpt: string;
  images: ImageArticleDTO;
  student_grade: Array<GradeDTO>;
  student_subject: Array<SubjectDTO>;
  student_level: Array<StudentLevelDTO>;
  level?: StudentLevelDTO;
  grep_coreelements?: Array<GreepElements>;
  grep_goals?: Array<GreepElements>;
  grep_maintopic?: Array<GreepElements>;
}

export interface ContentBlockDTO {
  type: ContentBlockType;
  orderPosition: number;
  text?: string;
  images?: Array<QuestionAttachment>;
  videos?: Array<QuestionAttachment>;
}

export interface OptionDTO {
  title: string;
  image?: QuestionAttachment | undefined;
  orderPosition?: number;
  isRight: boolean;
}

export interface QuestionDTO {
  id?: number;
  type: string;
  title: string;
  guidance: string;
  orderPosition: number;
  hide_answer: boolean | undefined;
  options?: Array<OptionDTO>;
  content?: Array<ContentBlockDTO>;
}

export interface TeacherAssignmentByIdResponseDTO {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  questions: Array<QuestionDTO>;
  subjects: Array<Subject>;
  grades: Array<Grade>;
  levels: Array<number>;
  relatedArticles: Array<Article>;
  ownedByMe: boolean;
}

export interface StudentAssignmentResponseDTO {
  id: number;
  title: string;
  description: string;
  numberOfQuestions: number;
  author: string;
  subjects: Array<SubjectDTO>;
  isAnswered: boolean;
  endDate: Date;
  featuredImage: string | null;
  backgroundImage: string | null;
  answerId: number | null;
  isPassed: boolean | null;
  mark: number | null;
  status: boolean | null;
  comment: string | null;
  levels: Array<number>;
  isEvaluated?: boolean;
}

export interface ArticleLevelRequestDTO {
  wpId?: number;
  childArticles?: Array<ArticleRequestDTO>;
}

export interface ArticleRequestDTO {
  wpId?: number;
  title: string;
  url?: string;
  levels?: Array<ArticleLevelRequestDTO>;
}

export interface AssignmentRequestDTO {
  title: string;
  description: string;
  questions: Array<QuestionDTO>;
  visibility: boolean;
  relatedArticles: Array<ArticleRequestDTO>;
  featuredImage: string | undefined;
}

export interface MultipleChoiceQuestionOptionDTO {
  title: string;
  isRight: boolean;
}

export interface ImageChoiceQuestionOptionDTO {
  title: string;
  image?: QuestionAttachment | undefined;
  orderPosition?: number;
  isRight: boolean;
}

interface AssignmentByIdResponseDTO {
  id: number;
  author: string;
  authorRole: string;
  backgroundImage: string;
  title: string;
  description: string;
  featuredImage: string;
  grades: Array<GradeDTO>;
  isPrivate: boolean;
  levels: Array<number>;
  questions: Array<QuestionDTO>;
  relatedArticles: Array<ArticleRequestDTO>;
  subjects: Array<SubjectDTO>;
  isPublished: boolean;
  view: string;
  hasGuidance: boolean;
  ownedByMe: boolean;
  created_at: string;
  /* subjects: Array<any>; */
  mainTopics: Array<any>;
  sources: Array<any>;
  coreElements: Array<any>;
  goals: Array<any>;
  open?: boolean;
  isMySchool?: boolean;
  isTranslations?: boolean;
  translations?: Array<Translations>;
  originalLocaleId?: number;
}

export class AssignmentApi implements AssignmentRepo {
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  private currentLocale = this.storageInteractor.getCurrentLocale()!;

  public async getAssignmentById(id: number): Promise<Assignment> {
    /* tslint:disable:no-string-literal */
    const search = parseQueryString(window.location.search)['locale_id'];
    /* tslint:enable:no-string-literal */
    const assignmentDTO: AssignmentByIdResponseDTO = search ? (await API.get(`api/teacher/assignments/${id}?localeId=${Number(search)}`)).data : (await API.get(`api/teacher/assignments/${id}`)).data;

    // questions and relatedArticles ignored here because it not essential for stores that use this method
    return new Assignment({
      id: assignmentDTO.id,
      author: assignmentDTO.author,
      authorRole: assignmentDTO.authorRole,
      backgroundImage: assignmentDTO.backgroundImage,
      title: assignmentDTO.title,
      createdAt: assignmentDTO.created_at,
      description: assignmentDTO.description,
      featuredImage: assignmentDTO.featuredImage,
      grades: assignmentDTO.grades,
      isPrivate: assignmentDTO.isPrivate,
      levels: assignmentDTO.levels,
      numberOfQuestions: assignmentDTO.questions.length,
      subjects: assignmentDTO.subjects,
      isPublished: assignmentDTO.isPublished,
      ownedByMe: assignmentDTO.ownedByMe,
      subjectItems: assignmentDTO.subjects.map(item => new GenericGrepItem(item.id, item.title)),
      coreElementItems: assignmentDTO.coreElements,
      multiSubjectItems: assignmentDTO.mainTopics,
      sourceItems: assignmentDTO.sources,
      goalsItems: assignmentDTO.goals,
      view: assignmentDTO.view,
      hasGuidance: assignmentDTO.hasGuidance,
      open: assignmentDTO.open,
      isMySchool: assignmentDTO.isMySchool,
      isTranslations: assignmentDTO.isTranslations,
      translations: assignmentDTO.translations,
      originalLocaleId: assignmentDTO.originalLocaleId
    });
  }

  public async getGrades(): Promise<Array<Grade>> {
    return (await API.get('api/classes')).data.data.map(
      (item: GradeDTO) => new Grade(item.id, item.title, item.managementId)
    );
  }

  public async getSubjects(): Promise<Array<Subject>> {
    return (await API.get('api/subjects')).data.data.map(
      (item: SubjectDTO) => new Subject(item.id, item.title, item.description, item.managementId)
    );
  }

  public async getSources(): Promise<Array<Source>> {
    const locale = this.storageInteractor.getCurrentLocale() as Locales;

    return (await API.get('api/sources', {
      params:
      {
        locale: this.currentLocale === Locales.EN ? null : LOCALES_MAPPING_FOR_BACKEND[locale]
      }
    })).data.data.map(
      (item: SourceDTO) => new Source(item.id, item.title, item.default)
    );
  }

  public async deleteAssignmentTranslation(assignmentId: number, localeId: number): Promise<void> {
    await API.delete(`/api/teacher/assignments/${assignmentId}/destroy-translation?localeId=${localeId}`);
  }

  public async removeAssignment(assignmentId: number): Promise<void> {
    try {
      await API.delete(`/api/teacher/assignments/${assignmentId}`);
    } catch (e) {
      throw Error(`remove assignment ${e}`);
    }
  }

  public async copyAssignment(id: number, all?:boolean): Promise<number> {
    if (all) {
      try {
        const response = await API.get(`api/teacher/assignments/${id}/copy/identical`);
        return response.data.id;
      } catch (e) {
        throw new Error(`copy assignment ${e}`);
      }
    }
    try {
      const response = await API.get(`api/teacher/assignments/${id}/copy`);

      return response.data.id;
    } catch (e) {
      throw new Error(`copy assignment ${e}`);
    }
  }

  public async copyAssignmentByLocale(id: number, localeid?: number, all?:boolean): Promise<number> {
    if (all) {
      try {
        const response = await API.get(`api/teacher/assignments/${id}/copy/identical?localeId=${localeid}`);
        return response.data.id;
      } catch (e) {
        throw new Error(`copy assignment ${e}`);
      }
    }
    try {
      const response = await API.get(`api/teacher/assignments/${id}/copy?localeId=${localeid}`);

      return response.data.id;
    } catch (e) {
      throw new Error(`copy assignment ${e}`);
    }
  }

  public async getMyAssignmentsList(filter: Filter) {
    if (!isNil(filter.searchQuery)) filter.searchQuery = String(filter.searchQuery!);
    const response = await API.get('api/teacher/assignments/draft', {
      params: buildFilterDTO(filter)
    });

    return {
      myAssignments: response.data.data.map(buildMyAssignmentsList),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async getAllAssignmentsList(filter: Filter) {
    try {
      if (!isNil(filter.searchQuery)) filter.searchQuery = String(filter.searchQuery!);
      const response = await API.get('api/teacher/assignments', {
        params: buildFilterDTO(filter)
      });

      return {
        myAssignments: response.data.data.map(buildAllAssignmentsList),
        total_pages: response.data.meta.pagination.total_pages
      };
    } catch {
      return {
        myAssignments: [],
        total_pages: 0
      };
    }
  }

  public async getAllSchoolAssignmentsList(filter: Filter) {
    try {
      if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
      const response = await API.get('api/teacher/assignments', {
        params: buildFilterDTO(filter)
      });

      return {
        myAssignments: response.data.data.map(buildAllAssignmentsList),
        total_pages: response.data.meta.pagination.total_pages
      };
    } catch {
      return {
        myAssignments: [],
        total_pages: 0
      };
    }
  }

  public async getInReviewAssignmentsList(filter: Filter) {
    try {
      if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
      const response = await API.get('api/teacher/assignments', {
        params: buildFilterDTO(filter)
      });

      return {
        myAssignments: response.data.data.map(buildAllAssignmentsList),
        total_pages: response.data.meta.pagination.total_pages
      };
    } catch {
      return {
        myAssignments: [],
        total_pages: 0
      };
    }
  }

  public async getGrepFiltersAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string): Promise<FilterGrep> {
    const response = await API.get('api/teacher/assignments/grep/filters', {
      params: {
        locale,
        grades,
        subjects,
        coreElements,
        goals
      }
    });
    return response.data;
  }

  public async getGrepFiltersMyAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string): Promise<FilterGrep> {
    const response = await API.get('api/teacher/assignments/draft/grep/filters', {
      params: {
        locale,
        grades,
        subjects,
        coreElements,
        goals
      }
    });
    return response.data;
  }

  public async getGrepFiltersMySchoolAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string): Promise<FilterGrep> {
    const response = await API.get('api/teacher/assignments/myschool/grep/filters', {
      params: {
        locale,
        grades,
        subjects,
        coreElements,
        goals
      }
    });
    return response.data;
  }

  public async getStudentAssignmentList(filter: Filter) {
    try {
      if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
      const response = await API.get('api/student/assignments', {
        params: buildFilterDTO(filter)
      });
      return {
        myAssignments: response.data.data.map(buildStudentAssignmentList),
        total_pages: response.data.meta.pagination.total_pages
      };
    } catch {
      return {
        myAssignments: [],
        total_pages: 0
      };
    }
  }

  public async getAssignmentListOfStudentInList(studentId: number, filter: Filter) {
    try {
      if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
      const response = await API.get('api/teacher/students/assignments', {
        params: {
          studentId,
          ...buildFilterDTO(filter)
        }
      });

      return {
        myAssignments: response.data.data.map(buildStudentAssignmentList),
        total_pages: response.data.meta.pagination.total_pages
      };
    } catch {
      return {
        myAssignments: [],
        total_pages: 0
      };
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

  public async getAssignmentDistributes(filter: Filter): Promise<{
    distributes: Array<AssignmentDistribute>,
    total_pages: number;
  }> {
    if (!isNil(filter.searchQuery)) filter.searchQuery = encodeURIComponent(filter.searchQuery!);
    const response = (await API.get('api/teacher/assignments/distributes', { params: filter })).data;

    return {
      distributes: response.data.map((distribute: AssignmentDistributeDTO) => new AssignmentDistribute(distribute)),
      total_pages: response.meta.pagination.total_pages,
    };
  }
  public async downloadTeacherGuidancePDF(id: number): Promise<void> {
    try {
      /* tslint:disable:no-string-literal */
      const search = parseQueryString(window.location.search)['locale_id'];
      /* tslint:enable:no-string-literal */
      const response = search ? await API.get(`api/teacher/assignments/${id}/guidance/download?localeId=${Number(search)}`, {
        responseType: 'blob',
        headers: { Accept: 'application/octet-stream' },
      }) : await API.get(`api/teacher/assignments/${id}/guidance/download`, {
        responseType: 'blob',
        headers: { Accept: 'application/octet-stream' },
      });

      const blob = new Blob([response.data], { type: 'text/plain' });
      const a = document.createElement('a');
      a.download = 'Assignment-Guidance.pdf';
      a.href = window.URL.createObjectURL(blob);
      const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      a.dispatchEvent(clickEvt);
      a.remove();
    } catch (e) {
      throw new Error(`download Assignment Guidance pdf ${e}`);
    }
  }
}

enum AttachmentType {
  customImage = 'customimg',
  image = 'img',
  video = 'video',
  sound = 'sound',
}

export class WPApi implements ArticleRepo {

  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  private currentLocale = this.storageInteractor.getCurrentLocale()!;

  public async getArticles({
    page = 1,
    perPage = DEFAULT_AMOUNT_ARTICLES_PER_PAGE,
    order,
    grades,
    core,
    goal,
    multi,
    source,
    subjects,
    searchTitle,
    lang,
  }: { page: number, perPage: number, order: string, grades?: number, subjects?: number, searchTitle?: string, core?: number | string, goal?: number | string, multi?: number, source?: number, lang: string }): Promise<Array<Article>> {

    let langParmeter = lang;
    if (lang === '' || (typeof (lang) === 'undefined')) langParmeter = this.storageInteractor.getArticlesLocaleId()!;

    try {
      return (
        await API.get(`${process.env.REACT_APP_WP_URL}/wp-articles/api/filterarticle/v1/post`, {
          params:
          {
            page,
            order_by: order,
            per_page: perPage,
            student_grade_id: grades || null,
            student_subject_id: subjects || null,
            core_id: core || null,
            goal_id: goal || null,
            student_disciplin_id: multi || null,
            student_source_id: source || null,
            search_title: searchTitle || null,
            lang: langParmeter || null
          }
        },
        )
      ).data.data.map(buildArticle);
    } catch {
      return [];
    }
  }

  public async getArticlesByIds(ids: Array<number>): Promise<Array<Article>> {
    const includes = ids.join();

    const response = await API.get(
      `${process.env.REACT_APP_WP_URL}/wp-json/getarticles/v1/post/`, {
        params: {
          ids: includes,
        // lang: this.currentLocale !== Locales.EN ? this.storageInteractor.getArticlesLocaleId() : null
        }
      }
    );

    return response.data.map(buildArticle);
  }

  public async fetchVideos(postIds: Array<number>): Promise<Array<Attachment>> {
    return (
      await API.get(
        `${process.env.REACT_APP_WP_URL}/wp-json/media/v1/post/`, {
          params: {
            id: postIds.join(),
            content: AttachmentType.video
          }
        }
      )
    ).data.media.map(buildAttachment);
  }

  public async fetchImages(postIds: Array<number>): Promise<Array<Attachment>> {
    const response = await API.get(
      `${process.env.REACT_APP_WP_URL}/wp-json/media/v1/post/`, {
        params: {
          id: postIds.join(','),
          content: AttachmentType.image,
          size: 'full'
        },
      }
    );
    if (response.data.media.length > 0) {
      return (response).data.media.map((item: AttachmentDTO) => new Attachment(item.id, item.url, item.alt, item.file_name, item.title, item.url_large, item.duration, item.src, item.source));
    }
    return [];
  }

  public async fetchCoverImages(postIds: Array<number>): Promise<Array<Attachment>> {
    const response = await API.get(
      `${process.env.REACT_APP_WP_URL}/wp-json/media/v1/post/`, {
        params: {
          id: postIds.join(','),
          content: AttachmentType.image,
          size: 'full'
        },
      }
    );
    if (response.data.media) {
      if (response.data.media.length > 0) {
        return (response).data.media.map((item: AttachmentDTO) => new Attachment(item.id, item.url, item.alt, item.file_name, item.title, item.url_large, item.duration, item.src));
      }
    }
    return [];
  }

  public async fetchCustomImages(ids:string, page: number, titleSearch: string): Promise<ResponseFetchCustomImages> {
    const parameters = (ids) ? {
      page: page!,
      per_page: DEFAULT_CUSTOM_IMAGES_PER_PAGE,
      selectedImages: ids,
      title: titleSearch,
    } : {
      page: page!,
      per_page: DEFAULT_CUSTOM_IMAGES_PER_PAGE,
      title: titleSearch,
    };
    const response = await API.get(
      `${process.env.REACT_APP_BASE_URL}/api/teacher/images`, {
        params: parameters,
      });
    const customImages = response.data.data.map((item: CustomImgAttachmentDTO) => new CustomImgAttachment(item.id!, item.path, item.title, item.title, item.title, 0, [], item.source!, item.deletedAt));
    const entirePage = Math.floor((response.data.meta.pagination.total / DEFAULT_CUSTOM_IMAGES_PER_PAGE));
    const modulePage = Math.floor((response.data.meta.pagination.total % DEFAULT_CUSTOM_IMAGES_PER_PAGE));
    return {
      myCustomImages: customImages,
      total_pages: modulePage !== 0 ? entirePage + 1 : entirePage,
    };
  }

  public async createCustomImage(fd: FormData): Promise<CustomImgAttachmentResponse> {
    return (
      /* await */ API.post(
      `${process.env.REACT_APP_BASE_URL}/api/teacher/images`, fd).then()
    );
  }

  public async deleteCustomImage(imageId: number): Promise<any> {
    return (
      /* await */ API.delete(
      `${process.env.REACT_APP_BASE_URL}/api/teacher/images/${imageId}`)
    );
  }

  public async updateCustomImage(customImageId: number, formData: FormData): Promise<any> {
    const formDataJSON = JSON.stringify(Object.fromEntries(formData));
    return (
      /* await */ API.put(
      `${process.env.REACT_APP_BASE_URL}/api/teacher/images/${customImageId}`, formDataJSON)
    );
  }

  public async increaseUse(imageId: number): Promise<any> {
    return (
      /* await */ API.post(
      `${process.env.REACT_APP_BASE_URL}/api/teacher/images/${imageId}/using`
    )
    );
  }

  public async decreaseUse(imageId: number): Promise<any> {
    return (
      /* await */ API.delete(
      `${process.env.REACT_APP_BASE_URL}/api/teacher/images/${imageId}/using`
    ).then()
    );
  }

  public async getLocaleData(locale: Locales): Promise<Array<WPLocale>> {
    return (await API.get(`${process.env.REACT_APP_WP_URL}/wp-json/getlang/v1/post/`, {
      params: {
        lang: locale
      }
    })).data;
  }
}

export interface ResponseFetchCustomImages {
  myCustomImages: Array<CustomImgAttachment>;
  total_pages: number;
}
