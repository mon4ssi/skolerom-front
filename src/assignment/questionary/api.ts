import { AxiosResponse } from 'axios';

import { API } from 'utils/api';
import { STATUS_CONFLICT, STATUS_FORBIDDEN } from 'utils/constants';
import { Questionary, QuestionaryRepo, AlreadyEditingAssignmentError, RedirectData } from 'assignment/questionary/Questionary';
import { buildQuestionaryRequestDTO, buildQuestionary, buildQuestionaryView } from './factory';
import { TypedQuestion, Article, QuestionType, Subject, Grade } from 'assignment/Assignment';
import { QuestionDTO, TeacherAssignmentByIdResponseDTO } from '../api';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import intl from 'react-intl-universal';

const SETTIMEOUT = 500;

export interface RevisionDTO {
  id: number;
  title: string;
  description: string;
  author: string;
  authoravatar: string;
  questions: Array<QuestionDTO>;
  relatedArticles: Array<Article>;
  featuredImage?: string;
  backgroundImage?: string;
}

export interface RevisionByIdDTO {
  questions: Array<TypedQuestion>;
  subjects: Array<Subject>;
  grades: Array<Grade>;
  answers: Array<AnswerResponseDTO>;
}

export interface AnswerResponseDTO {
  questionId: number;
  type: QuestionType;
  payload: string | Array<{ optionId: number; title: string }>;
}

export interface QuestionaryRequestDTO {
  uuid: string;
  answerContent: Array<AnswerResponseDTO>;
  redirectData?: RedirectData;
}

export interface DraftQuestionaryRequestDTO {
  uuid: string;
  answerContent: Array<AnswerResponseDTO>;
}

export interface QuestionaryResponseDTO {
  id: number;
  uuid?: string;
  answers: Array<AnswerResponseDTO> | null;
  revision: RevisionDTO;
  redirectData?: RedirectData;
}

export interface QuestionaryByIdResponseDTO {
  revisionId: number;
  title: string;
  numberOfQuestions: number;
  revisionContent: RevisionByIdDTO;
}

export class QuestionaryApi implements QuestionaryRepo {

  public async setReadStatusArticle(idAssignment: number, revision: number, wpArticle: number, levelId: number, graduation: number) {
    try {
      await API.put(`api/student/assignments/${idAssignment}/article/mark`, {
        revision,
        wpArticle,
        graduation
        // levelId TODO rework it in future
      });
    } catch (e) {
      throw e;
    }
  }

  public async getNewQuestionaryByAssignmentId(id: number): Promise<Questionary> {
    try {
      const response: AxiosResponse<QuestionaryResponseDTO> = await API.get(`api/student/assignments/${id}/answer/create`);
      return buildQuestionary(response.data, id);
    } catch (error) {
      if (error.response && error.response.status === STATUS_FORBIDDEN) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('assignment list.not for you')
        });
      }
      setTimeout(
        () => {
          window.location.href = '/assignments/';
        },
        SETTIMEOUT,
      );
      throw error;
    }
  }

  public async getNewQuestionaryByAssignmentIdFromTeachingPath(
    id: number,
    redirectData: RedirectData
    ): Promise<Questionary> {
    const response: AxiosResponse<QuestionaryResponseDTO> = await API.get(
      `api/student/teaching-paths/${redirectData.teachingPath}/node/${redirectData.node}/assignments/${id}/answer/create`, {
      });
    return buildQuestionary(response.data, id);
  }

  public async getAssignmentQuestionaryById(assignmentId: number):Promise<Questionary> {
    const response: AxiosResponse<TeacherAssignmentByIdResponseDTO> = await API.get(
      `api/teacher/assignments/${assignmentId}`
    );

    return buildQuestionaryView(response.data);
  }

  public async saveQuestionary(questionary: Questionary, redirectData?: RedirectData): Promise<string> {
    try {
      const response = await API.put(
        `api/student/assignments/${questionary.assignment.id}/answer/draft/${questionary.id}`,
        buildQuestionaryRequestDTO(questionary, redirectData)
      );

      return response.data.updateAt;
    } catch (error) {
      if (error.response.status === STATUS_CONFLICT) {
        throw new AlreadyEditingAssignmentError();
      }

      throw error;
    }
  }

  public async publishQuestionary(questionary: Questionary) {
    try {
      await API.post(`api/student/assignments/${questionary.assignment.id}/answer/${questionary.id}`, buildQuestionaryRequestDTO(questionary)
      );

    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.message
      });
    }
  }

  public async publishFromTeachingPath(questionary: Questionary, redirectData: RedirectData) {
    try {
      await API.post(`api/student/teaching-paths/${redirectData.teachingPath}/node/${redirectData.node}/assignments/${questionary.assignment.id}/answer/${questionary.id}`,
                     buildQuestionaryRequestDTO(questionary, redirectData)
      );
    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.message
      });
    }
  }

  public async deleteQuestionary(questionary: Questionary) {
    await API.delete(`api/student/assignments/${questionary.assignment.id}/answer/${questionary.id}`);
  }

  public async revertQuestionary(questionary: Questionary) {
    const { data } = await API.get(`api/student/assignments/${questionary.assignment.id}/answer/${questionary.id}/revert`);
    return buildQuestionary(data, questionary.assignment.id);
  }
}
