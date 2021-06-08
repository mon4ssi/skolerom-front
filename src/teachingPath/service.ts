import { TEACHING_PATH_REPO, TeachingPathRepo } from './TeachingPath';
import { injector } from '../Injector';
import { Filter } from '../assignment/Assignment';

export const TEACHING_PATH_SERVICE = 'TEACHING_PATH_SERVICE';

export class TeachingPathService {

  protected teachingPathRepo: TeachingPathRepo = injector.get<TeachingPathRepo>(TEACHING_PATH_REPO);

  public async getAllTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getAllTeachingPathsList(filter);
  }

  public async getMyTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getMyTeachingPathsList(filter);
  }

  public async getStudentTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getStudentTeachingPathsList(filter);
  }

  public async getTeachingPathById(id: number) {
    return this.teachingPathRepo.getTeachingPathById(id);
  }

  public async getCurrentNode(teachingPathId: number, nodeId: number) {
    return this.teachingPathRepo.getCurrentNode(teachingPathId, nodeId);
  }

  public async markAsPickedArticle(teachingPathId: number, nodeId: number, idArticle: number, levelWpId: number) {
    return this.teachingPathRepo.markAsPickedArticle(teachingPathId, nodeId, idArticle, levelWpId);
  }

  public async sendDataDomain(domain: string) {
    return this.teachingPathRepo.sendDataDomain(domain);
  }

  public async finishTeachingPath(id: number) {
    return this.teachingPathRepo.finishTeachingPath(id);
  }

  public async copyTeachingPath(id: number) {
    return this.teachingPathRepo.copyTeachingPath(id);
  }

  public async deleteTeachingPathAnswers(teachingPathId: number, answerId: number) {
    return this.teachingPathRepo.deleteTeachingPathAnswers(teachingPathId, answerId);
  }
}
