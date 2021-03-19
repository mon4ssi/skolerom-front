import { injector } from 'Injector';
import {
  EditableEvaluation,
  ASSIGNMENT_EVALUATION_REPO,
  AssignmentEvaluationRepo,
  TEACHING_PATH_EVALUATION_REPO,
  TeachingPathEvaluationRepo
} from 'evaluation/Evaluation';
import { Filter } from 'assignment/Assignment';

export const ASSIGNMENT_EVALUATION_SERVICE = 'ASSIGNMENT_EVALUATION_SERVICE';
export const TEACHING_PATH_EVALUATION_SERVICE = 'TEACHING_PATH_EVALUATION_SERVICE';

export class AssignmentEvaluationService {
  protected evaluationRepo: AssignmentEvaluationRepo = injector.get<AssignmentEvaluationRepo>(ASSIGNMENT_EVALUATION_REPO);

  public async getListOfAnswersToAssignment(id: number, filter: Filter) {
    return this.evaluationRepo.getListOfAnswersToAssignment(id, filter);
  }

  public async getAnswersById(assignmentId: number, answerId: number) {
    return this.evaluationRepo.getAnswersById(assignmentId, answerId);
  }

  public async getAnswersByIdForStudent(assignmentId: number, answerId: number) {
    return this.evaluationRepo.getAnswersByIdForStudent(assignmentId, answerId);
  }

  public async getDraftAnswersById(assignmentId: number, answerId: number) {
    return this.evaluationRepo.getDraftAnswersById(assignmentId, answerId);
  }

  public async saveEvaluation(assignmentId: number, answerId: number, evaluation: EditableEvaluation) {
    return this.evaluationRepo.saveEvaluation(assignmentId, answerId, evaluation);
  }

  public async publishEvaluation(assignmentId: number, answerId: number, evaluation: EditableEvaluation) {
    return this.evaluationRepo.publishEvaluation(assignmentId, answerId, evaluation);
  }
}

export class TeachingPathEvaluationService {

  protected evaluationRepo: TeachingPathEvaluationRepo = injector.get<TeachingPathEvaluationRepo>(TEACHING_PATH_EVALUATION_REPO);

  public async getTeachingPathAnswersList(id: number, filter: Filter) {
    return this.evaluationRepo.getTeachingPathAnswersList(id, filter);
  }

  public async getDraftAnswersById(teachingPathId: number, answerId: number) {
    return this.evaluationRepo.getDraftAnswersById(teachingPathId, answerId);
  }

  public async getAnswersById(teachingPathId: number, answerId: number) {
    return this.evaluationRepo.getAnswersById(teachingPathId, answerId);
  }

  public async getNodeById(nodeId: number, teachingPathId: number) {
    return this.evaluationRepo.getNodeById(nodeId, teachingPathId);
  }

  public async saveEvaluation(teachingPathId: number, answerId: number, evaluation: EditableEvaluation) {
    return this.evaluationRepo.saveEvaluation(teachingPathId, answerId, evaluation);
  }

  public async publishEvaluation(teachingPathId: number, answerId: number, evaluation: EditableEvaluation) {
    return this.evaluationRepo.publishEvaluation(teachingPathId, answerId, evaluation);
  }

  public async getEvaluationForStudent(teachingPathId: number, answerId: number) {
    return this.evaluationRepo.getEvaluationForStudent(teachingPathId, answerId);
  }
}
