import { AxiosResponse } from 'axios';

import { API } from 'utils/api';

import { TeachingPathNodeType } from '../TeachingPath';
import { TeachingPathNodeResponseDTO } from '../api';
import { DraftTeachingPath, DraftTeachingPathRepo, AlreadyEditingTeachingPathError } from './TeachingPathDraft';
import {
  buildNewTeachingPath,
  buildDraftTeachingPath,
  buildTeachingPathRequestDTO,
  buildArrayAllWpIds,
  buildFeatureImageForTeachingPathRequestDTO
} from './factory';
import { Grade, Article, ArticleRepo, ARTICLE_REPO_KEY, NowSchool } from 'assignment/Assignment';
import { injector } from '../../Injector';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { STATUS_CONFLICT } from 'utils/constants';

const NOT_FOUND_CODE = 404;

interface GradeAndSubjectReponseDTO {
  id: number;
  title: string;
}

export interface DraftTeachingPathResponseDTO {
  id: number;
  uuid: string;
  title?: string;
  description?: string;
  guidance?: string;
  hasGuidance?: boolean;
  isPrivate?: boolean;
  isMySchool?: boolean;
  mySchools?: string | undefined;
  content: TeachingPathNodeResponseDTO | null;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  grades?: Array<GradeAndSubjectReponseDTO>;
  subjects?: Array<GradeAndSubjectReponseDTO>;
  levels: Array<number>;
  ownedByMe?: boolean;
  isCopy: boolean;
  inReview: boolean;
  grepCoreElementsIds?: Array<number>;
  grepMainTopicsIds?: Array<number>;
  grepReadingInSubjectsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  sources?: Array<number>;
  keywords?: Array<string>;
  open?: boolean;
  schools?: Array<NowSchool>;
  selectedArticlesIds: Array<number>;
  selectedAssignmentsIds: Array<number>;
  backgroundImage?: string;
  featuredImage: string;
  localeId: number | null;
}

export interface TeachingPathItemRequestDTO {
  id?: number;
  wpId?: number;
  title?: string;
  grades: Array<Grade>;
  excerpt?: string;
  url?: string;
  images?: { id: number; url: string };
  numberOfQuestions?: number;
  relatedArticles?: Array<Article>;
}

export interface TeachingPathItemSaveResponseDTO {
  id?: number;
  wpID?: number;
  title: string;
  description?: string;
  grades: Array<Grade>;
  url?: string;
  excerpt?: string;
  numberOfQuestions?: number;
  relatedArticles?: Array<Article>;
  images?: { id: number, url: string, url_large?: string, };
  featuredImage?: string;
  backgroundImage?: string;
  hasGuidance?: boolean;
  open?: boolean;
}

export interface TeachingPathNodeSaveResponseDTO {
  type: TeachingPathNodeType;
  selectQuestion: string;
  guidance: string;
  featuredImage?: string;
  items: Array<TeachingPathItemSaveResponseDTO> | null;
  children: Array<TeachingPathNodeSaveResponseDTO>;
}

export class DraftTeachingPathApi implements DraftTeachingPathRepo {
  public articleRepo: ArticleRepo = injector.get(ARTICLE_REPO_KEY);

  public createTeachingPath = async () => {
    try {
      const response: AxiosResponse<DraftTeachingPathResponseDTO> = await API.get(
        '/api/teacher/teaching-paths/create'
      );
      return buildNewTeachingPath(response.data);
    } catch (error : any) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error
      });
      throw error;
    }
  }

  public createTeachingPathLocale = async (id: number, localeid?: number) => {
    try {
      const response: AxiosResponse<DraftTeachingPathResponseDTO> = await API.get(
        `/api/teacher/teaching-paths/draft/${id}/create?localeId=${localeid}`
      );
      return buildNewTeachingPath(response.data);
    } catch (error : any) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error
      });
      throw error;
    }
  }

  public getDraftTeachingPathById = async (id: number, localeid?: number) => {
    try {
      const response: AxiosResponse<DraftTeachingPathResponseDTO> = (localeid && !isNaN(localeid)) ? await API.get(
        `/api/teacher/teaching-paths/draft/${id}/edit?localeId=${localeid}`
      ) : await API.get(
        `/api/teacher/teaching-paths/draft/${id}/edit`
      );
      return response.data.content ?
        buildDraftTeachingPath(response.data) :
        buildNewTeachingPath(response.data);

    } catch (error) {
      throw error;
    }
  }

  public getDraftForeignTeachingPathById = async (id: number, isPreview?: boolean, localeid?: number) => {
    try {
      const response: AxiosResponse<DraftTeachingPathResponseDTO> = await API.get(
        `/api/teacher/teaching-paths/${id}`, {
          params: {
            localeId: localeid,
            withBackground: isPreview
          }
        }
      );
      const draftTeachingPath = buildDraftTeachingPath(response.data);
      const allWpIds = buildArrayAllWpIds(draftTeachingPath);

      if (allWpIds.length) {
        const articles = await this.articleRepo.getArticlesByIds(allWpIds);
        return { articles, teachingPath: draftTeachingPath };
      }
      return { teachingPath: draftTeachingPath };
    } catch (error) {
      alert(error);
      throw error;
    }
  }

  public saveTeachingPath = async (teachingPath: DraftTeachingPath, localeId?: number): Promise<string> => {
    const dto = buildTeachingPathRequestDTO(teachingPath);
    const mylocaleid = (localeId && !isNaN(localeId)) ? localeId : dto.localeId;
    // const featuredImage = buildFeatureImageForTeachingPathRequestDTO(dto.content);
    try {
      const response = localeId ? await API.put(
        `/api/teacher/teaching-paths/draft/${teachingPath.id}?localeId=${mylocaleid}`, {
          ...dto
        }) : await API.put(
        `/api/teacher/teaching-paths/draft/${teachingPath.id}`, {
          ...dto
        })
      ;
      return response.data.updateAt;
    } catch (error : any) {
      if (error.response.status === STATUS_CONFLICT) {
        throw new AlreadyEditingTeachingPathError();
      }
      throw error;
    }
  }

  public saveTeachingPathLang = async (teachingPath: DraftTeachingPath, localeId?: number, actuallocalid?: number, newlocalid?: number): Promise<string> => {
    const dto = buildTeachingPathRequestDTO(teachingPath);
    const mylocaleid = (localeId && !isNaN(localeId)) ? localeId : dto.localeId;
    // const featuredImage = buildFeatureImageForTeachingPathRequestDTO(dto.content);
    try {
      const response = await API.put(
        `/api/teacher/teaching-paths/draft/${teachingPath.id}?localeId=${actuallocalid}`, {
          ...dto
        });
      return response.data.updateAt;
    } catch (error : any) {
      if (error.response.status === STATUS_CONFLICT) {
        throw new AlreadyEditingTeachingPathError();
      }
      throw error;
    }
  }

  public async getKeywordsFromArticles(arrayArticlesIds: Array<number>, arrayAssignmentsIds: Array<number>): Promise<any> {
    const idsArticlesString = arrayArticlesIds.toString();
    const idsAssignmentsString = arrayAssignmentsIds.toString();
    try {
      return (await API.get(
        'api/teacher/teaching-paths/getTags', {
          params: {
            articleIds: idsArticlesString,
            assigIds: idsAssignmentsString,
          }
        })).data;
    } catch (error : any) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.response.message
      });
    }
  }

  public publishTeachingPath = async (teachingPath: DraftTeachingPath): Promise<void> => {
    const dto = buildTeachingPathRequestDTO(teachingPath);
    const featuredImage = buildFeatureImageForTeachingPathRequestDTO(dto.content);

    try {
      return await API.post(
        `/api/teacher/teaching-paths/${teachingPath.id}`, {
          ...dto
        }
      );
    } catch (error : any) {
      throw new Error(error.message);
    }
  }

  public deleteTeachingPath = async (id: number): Promise<void> => {
    try {
      await API.delete(`api/teacher/teaching-paths/${id}`);
    } catch (error : any) {
      if (error.response.status === NOT_FOUND_CODE) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: error.response.data.message
        });
      }
      throw new Error(error.message);
    }
  }
}
