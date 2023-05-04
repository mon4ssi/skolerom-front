import { AxiosResponse } from 'axios';

import { Grade, NowSchool, Subject, Translations } from '../Assignment';
import { DraftAssignmentRepo, DraftAssignment, AlreadyEditingAssignmentError } from './AssignmentDraft';
import { buildNewDraftAssignment, buildDraftAssignment, buildDraftAssignmentDTO } from './factory';
import { API } from 'utils/api';
import { STATUS_CONFLICT } from 'utils/constants';
import { AssignmentRequestDTO } from '../api';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

export interface DraftAssignmentResponseDTO extends NewDraftAssignmentResponseDTO {
  isPrivate: boolean;
  isMySchool: boolean;
  inReview: boolean;
  mySchools: string | undefined;
  grades: Array<Grade>;
  subjects: Array<Subject>;
  levels: Array<number>;
  updatedAt: string;
}

export interface NewDraftAssignmentResponseDTO {
  id: number;
  uuid: string;
  assignmentContent: string;
  backgroundImage: string;
  isCopy: boolean;
  keywords?: Array<string>;
  grepCoreElementsIds?: Array<number>;
  grepMainTopicsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  grepReadingInSubjectsIds?: number;
  sources?: Array<number>;
  guidance?: string;
  hasGuidance?: boolean;
  open?: boolean;
  schools?: Array<NowSchool>;
  localeId: number | null;
  isTranslations?: boolean;
  translations?: Array<Translations>;
  originalLocaleId?: number;
}

export interface DraftAssignmentRequestDTO {
  uuid: string;
  backgroundImage: string;
  title: string;
  description: string;
  guidance: string;
  numberOfQuestions: number;
  isPrivate: boolean;
  isMySchool: boolean;
  mySchools: string | undefined;
  assignmentContent: AssignmentRequestDTO;
  featuredImage?: string;
  subjects: Array<Subject>;
  grades: Array<Grade>;
  levels: Array<number>;
  isPublished?: boolean;
  isCopy?: boolean;
  inReview?: boolean;
  keywords?: Array<string>;
  grepCoreElementsIds?: Array<number>;
  grepMainTopicsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  grepReadingInSubjectsIds?: Array<number>;
  sources?: Array<number>;
  open?: boolean;
  localeId: number | null;
  isTranslations?: boolean;
  translations?: Array<Translations>;
  originalLocaleId?: number;
}

export class DraftAssignmentApi implements DraftAssignmentRepo {

  public async getNewAssignment(): Promise<DraftAssignment> {
    const result: NewDraftAssignmentResponseDTO = (await API.get('api/teacher/assignments/create'))
      .data;
    return buildNewDraftAssignment(result);
  }

  public async getDraftAssignmentById(id: number): Promise<DraftAssignment> {
    try {
      const response: AxiosResponse<DraftAssignmentResponseDTO> = await API.get(`api/teacher/assignments/draft/${id}/edit`);
      return response.data.assignmentContent ?
        buildDraftAssignment(response.data) :
        buildNewDraftAssignment(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async saveDraftAssignment(
    draftAssignment: DraftAssignment
  ): Promise<string> {
    try {
      const response = await API.put(
        `api/teacher/assignments/draft/${draftAssignment.id}`,
        buildDraftAssignmentDTO(draftAssignment)
      );
      return response.data.updateAt;
    } catch (error) {
      if (error.response.status === STATUS_CONFLICT) {
        throw new AlreadyEditingAssignmentError();
      }

      throw error;
    }
  }

  public async getKeywordsFromArticles(arrayWpIds: Array<number>): Promise<any> {
    const idsString = arrayWpIds.toString();
    try {
      return (await API.get(
        'api/teacher/assignments/getTags', {
          params: {
            articleIds: idsString,
          }
        })).data;
    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.response.message
      });
    }
  }

  public async publishAssignment(draftAssignment: DraftAssignment): Promise<void> {
    try {
      return API.post(
        `api/teacher/assignments/${draftAssignment.id}`,
        buildDraftAssignmentDTO(draftAssignment)
      );
    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.response.message
      });
    }
  }

  public async saveAttachment(assignmentId: number, attachmentId: number): Promise<void> {
    try {
      await API.post(`api/teacher/assignments/${assignmentId}/resource`, {
        wpId: attachmentId
      });
    } catch (e) {
      throw Error(`unable to attach file ${e}`);
    }
  }

  public async removeAttachment(assignmentId: number, attachmentId: number): Promise<number> {
    try {
      const response = await API.delete(`api/teacher/assignments/${assignmentId}/resource`, {
        data: {
          wpId: attachmentId
        }
      });

      return response.status;

    } catch (e) {
      throw Error(`unable to remove file ${e}`);
    }
  }
}
