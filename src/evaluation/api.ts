import isNull from 'lodash/isNull';
import moment from 'moment';
import { EditableEvaluation, AssignmentEvaluationRepo, TeachingPathEvaluationRepo, EvaluationAnswer } from './Evaluation';
import { API } from 'utils/api';
import { Filter, ReadLevel } from '../assignment/Assignment';
import { buildFilterDTO } from '../assignment/factory';
import { buildEvaluateQuestions, buildEvaluateTeachingPath, buildSaveEvaluationDTO, buildStudentTeachingPathEvaluation } from './factory';
import { ContentBlock } from '../assignment/ContentBlock';
import { OptionDTO } from '../assignment/api';
import { EntityType } from 'utils/enums';
import { StudentTeachingPathNodeResponseDTO, TeachingPathNodeItemResponseDTO } from 'teachingPath/api';

export interface AnswersDTO {
  questionAnswerId: number;
  payload: Array<{
    optionId: number,
    title: string
  }>;
  questionId: number;
  type: string;
  comment: string | null;
}

export interface QuestionsDTO {
  id: number;
  orderPosition: number;
  type: string;
  title: string;
  content: Array<ContentBlock>;
  options?: Array<OptionDTO>;
}

export interface RevisionContentDTO {
  answers: Array<AnswersDTO>;
  questions: Array<QuestionsDTO>;
  author?: string;
}

export interface AnswerDraft {
  uuid: string;
  commentToEntity: string | null;
  commentsToAnswers: Array<{
    questionAnswerId: number,
    comment: string;
  }> | null;
}

export interface ReadArticleDataDTO {
  id: number;
  readLevel: ReadLevel;
  title: string;
  wpId: number;
}

export interface AnswersResponseDTO {
  revisionId: number;
  assignmentId?: number;
  comment: string | null;
  isPassed?: boolean | null;
  mark?: number | null;
  status?: boolean | null;
  revisionContent: RevisionContentDTO;
  readArticleData: Array<ReadArticleDataDTO>;
}

interface SelectedArticlesDTO {
  level: number;
  node_id: number;
  article_id: number;
}

interface SelectedAssignmentsDTO {
  node_id: number;
  assignment_id: number;
}

export interface StudentTeachingPathEvaluationRevisionContentDTO {
  id: number;
  title: string;
  description: string;
  featuredImage: string;
  levels: Array<number>;
  content: StudentTeachingPathNodeResponseDTO;
}

export interface TeachingPathAnswerResponseDTO {
  id: number;
  selectedArticles: Array<SelectedArticlesDTO>;
  selectedAssignments: Array<SelectedAssignmentsDTO>;
  path: Array<number>;
  assignmentAnswers: Array<AnswersResponseDTO>;
  comment: string | null;
  status: boolean | null;
  isPassed: boolean | null;
  mark: number | null;
  isAnswered: boolean;
}

export interface StudentTeachingPathEvaluationDTO {
  id: number;
  selectedArticles: Array<SelectedArticlesDTO>;
  selectedAssignments: Array<SelectedAssignmentsDTO>;
  path: Array<number>;
  comment: string | null;
  status: boolean | null;
  isPassed: boolean | null;
  mark: number | null;
  isAnswered: boolean;
  revisionContent: StudentTeachingPathEvaluationRevisionContentDTO;
  assignmentAnswers: Array<AnswersResponseDTO>;
  author: string;
}

export interface TeachingPathAnswer {
  id: number;
  selectedArticles: Array<SelectedArticlesDTO>;
  selectedAssignments: Array<SelectedAssignmentsDTO>;
  path: Array<number>;
  assignmentAnswers: Array<EvaluationAnswer>;
  comment: string | null;
  status: boolean | null;
  isPassed: boolean | null;
  mark: number | null;
  isAnswered: boolean;
}

export interface StudentTeachingPathAnswer extends TeachingPathAnswer {
  revisionContent: StudentTeachingPathEvaluationRevisionContentDTO;
  author: string;
}

interface ListAnswers {
  answerId: number;
  studentId: number;
  studentName: string;
  status: boolean | null;
  isAnswered: boolean;
  isPassed: boolean | null;
  mark: number | null;
  startDate: string;
  endDate: string;
}

export interface EvaluateTeachingPathNode {
  id: number;
  type: string;
  items: Array<EvaluateTeachingPathNodeAssignmentItem | EvaluateTeachingPathNodeArticleItem>;
  children: Array<EvaluateTeachingPathNode>;
}

export interface EvaluateTeachingPathNodeAssignmentItem {
  id: number;
  title: string;
  featuredImage: string;
  levels: Array<number>;
  numberOfQuestions: number;
  isSelected?: boolean;
}

export interface EvaluateTeachingPathNodeArticleItem {
  id: number;
  wpId?: number;
  title: string;
  featuredImage?: string;
  levels: number;
  isSelected?: boolean;
  url?: string;
}

export interface StudentTeachingPathEvaluationNodeItem extends TeachingPathNodeItemResponseDTO {
  levels: Array<number>;
  featuredImage?: string;
}

export class AssignmentEvaluationApi implements AssignmentEvaluationRepo {

  public async getListOfAnswersToAssignment(id: number, filter: Filter) {
    const { data } = await API.get(`api/teacher/assignments/${id}/answer`, {
      params: buildFilterDTO(filter)
    });

    return {
      listAnswers: data.data.map((item: ListAnswers) => new EditableEvaluation({
        entityType: EntityType.ASSIGNMENT,
        answerId: item.answerId,
        studentId: item.studentId,
        studentName: item.studentName,
        isAnswered: item.isAnswered,
        isPassed: item.isPassed,
        mark: item.mark,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        isReadyToEvaluate: moment(item.endDate).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD'),
        uuid: '',
        content: { commentToEntity: '', commentsToAnswers: [] }
      })),
      total_pages: data.meta.pagination.total_pages
    };
  }

  public async getAnswersById(assignmentId: number, answerId: number) {
    const { data } = await API.get(`api/teacher/assignments/${assignmentId}/answer/${answerId}`);
    return buildEvaluateQuestions(data);
  }

  public async getDraftAnswersById(assignmentId: number, answerId: number) {
    const { data } = await API.get(`api/teacher/assignments/${assignmentId}/answer/${answerId}/evaluate`);
    return {
      commentToEntity: data.content ? data.content.commentToEntity : null,
      commentsToAnswers: data.content ? data.content.commentsToAnswers : null,
      uuid: data.uuid
    };
  }

  public async saveEvaluation(assignmentId: number, answerId: number, evaluation: EditableEvaluation) {
    await API.put(`api/teacher/assignments/${assignmentId}/answer/${answerId}/evaluate`, buildSaveEvaluationDTO(evaluation));
  }

  public async publishEvaluation(assignmentId: number, answerId: number, evaluation: EditableEvaluation) {
    await API.post(`api/teacher/assignments/${assignmentId}/answer/${answerId}/evaluate`, buildSaveEvaluationDTO(evaluation));
  }

  public async getAnswersByIdForStudent(assignmentId: number, answerId: number) {
    const { data }: {data: AnswersResponseDTO} = await API.get(`api/student/assignments/${assignmentId}/answer/${answerId}`);
    return {
      answerInfo: buildEvaluateQuestions(data),
      evaluation: new EditableEvaluation({
        entityType: EntityType.ASSIGNMENT,
        isPassed: data.isPassed!,
        mark: data.mark!,
        status: data.status!,
        author: data.revisionContent.author,
        content: {
          commentToEntity: data.comment!,
          commentsToAnswers: data.revisionContent.answers.map(item => ({
            questionAnswerId: item.questionAnswerId,
            comment: isNull(item.comment) ? '' : item.comment
          }))
        }
      })
    };
  }

}

export class TeachingPathEvaluationApi implements TeachingPathEvaluationRepo {

  public async getTeachingPathAnswersList(id: number, filter: Filter) {
    const { data } = await API.get(`api/teacher/teaching-paths/${id}/answer`, {
      params: buildFilterDTO(filter)
    });

    return {
      answersList: data.data.map((item: ListAnswers) => new EditableEvaluation({
        entityType: EntityType.TEACHING_PATH,
        answerId: item.answerId,
        studentId: item.studentId,
        studentName: item.studentName,
        isAnswered: item.isAnswered,
        isPassed: item.isPassed,
        mark: item.mark,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        isReadyToEvaluate: moment(item.endDate).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD'),
        uuid: '',
        content: { commentToEntity: '', commentsToAnswers: [] }
      })),
      total_pages: data.meta.pagination.total_pages
    };
  }

  public async getDraftAnswersById(teachingPathId: number, answerId: number) {
    const { data } = await API.get(`api/teacher/teaching-paths/${teachingPathId}/answer/${answerId}/evaluate`);
    return {
      commentToEntity: data.content ? data.content.commentToEntity : null,
      commentsToAnswers: data.content ? data.content.commentsToAnswers : null,
      uuid: data.uuid
    };
  }

  public async getAnswersById(teachingPathId: number, answerId: number) {
    const { data } = await API.get(`api/teacher/teaching-paths/${teachingPathId}/answer/${answerId}`);
    return buildEvaluateTeachingPath(data);
  }

  public async getNodeById(nodeId: number, teachingPathId: number) {
    const { data } = await API.get(`api/teacher/teaching-paths/${teachingPathId}/node/${nodeId}`);
    return data;
  }

  public async saveEvaluation(teachingPathId: number, answerId: number, evaluation: EditableEvaluation) {
    await API.put(`api/teacher/teaching-paths/${teachingPathId}/answer/${answerId}/evaluate`, buildSaveEvaluationDTO(evaluation));
  }

  public async publishEvaluation(teachingPathId: number, answerId: number, evaluation: EditableEvaluation) {
    await API.post(`api/teacher/teaching-paths/${teachingPathId}/answer/${answerId}/evaluate`, buildSaveEvaluationDTO(evaluation));
  }

  public async getEvaluationForStudent(teachingPathId: number, answerId: number) {
    const { data } = await API.get(`api/student/teaching-paths/${teachingPathId}/answer/${answerId}`);
    return buildStudentTeachingPathEvaluation(data);
  }
}
