import { AxiosResponse } from 'axios';

import { Grade, Subject } from '../Assignment';
import { DraftAssignmentRepo, DraftAssignment, AlreadyEditingAssignmentError } from './AssignmentDraft';
import { buildNewDraftAssignment, buildDraftAssignment, buildDraftAssignmentDTO } from './factory';
import { API } from 'utils/api';
import { STATUS_CONFLICT } from 'utils/constants';
import { AssignmentRequestDTO } from '../api';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

export interface DraftAssignmentResponseDTO extends NewDraftAssignmentResponseDTO {
  isPrivate: boolean;
  grades: Array<Grade>;
  subjects: Array<Subject>;
  levels: Array<number>;
  updatedAt: string;
}

export interface NewDraftAssignmentResponseDTO {
  id: number;
  uuid: string;
  assignmentContent: string;
  isCopy: boolean;
  grepCoreElementsIds?: Array<number>;
  grepMainTopicsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  grepReadingInSubjectsIds?: number;
  sources?: Array<number>;
  guidance?: string;
  hasGuidance?: boolean;
  open?: boolean;
}

export interface DraftAssignmentRequestDTO {
  uuid: string;
  title: string;
  description: string;
  guidance: string;
  numberOfQuestions: number;
  isPrivate: boolean;
  assignmentContent: AssignmentRequestDTO;
  featuredImage?: string;
  subjects: Array<Subject>;
  grades: Array<Grade>;
  levels: Array<number>;
  isCopy?: boolean;
  grepCoreElementsIds?: Array<number>;
  grepMainTopicsIds?: Array<number>;
  grepGoalsIds?: Array<number>;
  grepReadingInSubjectsIds?: Array<number>;
  sources?: Array<number>;
  open?: boolean;
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
