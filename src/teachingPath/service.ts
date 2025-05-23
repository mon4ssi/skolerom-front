import { TEACHING_PATH_REPO, TeachingPathRepo, TeachingPath } from './TeachingPath';
import { injector } from '../Injector';
import { Filter } from '../assignment/Assignment';

export const TEACHING_PATH_SERVICE = 'TEACHING_PATH_SERVICE';

export class TeachingPathService {

  protected teachingPathRepo: TeachingPathRepo = injector.get<TeachingPathRepo>(TEACHING_PATH_REPO);

  public async getAllTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getAllTeachingPathsList(filter);
  }

  public async getMySchoolTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getMySchoolTeachingPathsList(filter);
  }

  public async getMyTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getMyTeachingPathsList(filter);
  }

  public async getStudentTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getStudentTeachingPathsList(filter);
  }

  public async getInReviewTeachingPathsList(filter: Filter) {
    return this.teachingPathRepo.getInReviewTeachingPathsList(filter);
  }

  public async getTeachingPathDataById(id: number): Promise<TeachingPath> {
    return this.teachingPathRepo.getTeachingPathDataById(id);
  }

  public async getTeachingPathById(id: number) {
    return this.teachingPathRepo.getTeachingPathById(id);
  }

  public async getTeachingPathByIdTeacher(id: number) {
    return this.teachingPathRepo.getTeachingPathByIdTeacher(id);
  }

  public async getCurrentNode(teachingPathId: number, nodeId: number) {
    return this.teachingPathRepo.getCurrentNode(teachingPathId, nodeId);
  }

  public async getCurrentNodePreview(teachingPathId: number, nodeId: number) {
    return this.teachingPathRepo.getCurrentNodePreview(teachingPathId, nodeId);
  }

  public async markAsPickedArticle(teachingPathId: number, nodeId: number, idArticle: number, levelWpId: number) {
    return this.teachingPathRepo.markAsPickedArticle(teachingPathId, nodeId, idArticle, levelWpId);
  }

  public async sendDataDomain(domain: string) {
    return this.teachingPathRepo.sendDataDomain(domain);
  }

  public async getFiltersArticlePanel(lang: string) {
    return this.teachingPathRepo.getFiltersArticlePanel(lang);
  }

  public async getGradeWpIds(gradeWpIds: Array<number>) {
    return this.teachingPathRepo.getGradeWpIds(gradeWpIds);
  }

  public async getSubjectWpIds(subjectWpIds: Array<number>) {
    return this.teachingPathRepo.getSubjectWpIds(subjectWpIds);
  }

  public async getTeachingPathDistributes(filter: Filter) {
    return this.teachingPathRepo.getTeachingPathDistributes(filter);
  }

  public async getGrepFilters(grades: string, subjects: string, coreElements?: string, goals? : string) {
    return this.teachingPathRepo.getGrepFilters(grades, subjects, coreElements, goals);
  }

  public async getGrepFiltersTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals? : string, source?:string) {
    return this.teachingPathRepo.getGrepFiltersTeachingPath(locale, grades, subjects, coreElements, mainTopics, goals, source);
  }
  public async getGrepFiltersMyTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals? : string, source?:string) {
    return this.teachingPathRepo.getGrepFiltersMyTeachingPath(locale, grades, subjects, coreElements, mainTopics, goals, source);
  }
  public async getGrepFiltersMyschoolTeachingPath(locale: string, grades: string, subjects: string, coreElements?: string, mainTopics?:string, goals? : string, source?:string) {
    return this.teachingPathRepo.getGrepFiltersMyschoolTeachingPath(locale, grades, subjects, coreElements, mainTopics, goals, source);
  }

  public async getGrepGoalsFilters(grepCoreElementsIds: Array<number>, grepMainTopicsIds: Array<number>, gradesIds: Array<number>, subjectsIds: Array<number>, orderGoalsCodes: Array<string>, perPage: number, page: number) {
    return this.teachingPathRepo.getGrepGoalsFilters(grepCoreElementsIds, grepMainTopicsIds, gradesIds, subjectsIds, orderGoalsCodes, perPage, page);
  }

  public async finishTeachingPath(id: number) {
    return this.teachingPathRepo.finishTeachingPath(id);
  }

  public async copyTeachingPath(id: number, all?: boolean) {
    return this.teachingPathRepo.copyTeachingPath(id, all);
  }

  public async copyTeachingPathByLocale(id: number, localeid: number, all?: boolean) {
    return this.teachingPathRepo.copyTeachingPathByLocale(id, localeid, all);
  }

  public async deleteTeachingPathAnswers(teachingPathId: number, answerId: number) {
    return this.teachingPathRepo.deleteTeachingPathAnswers(teachingPathId, answerId);
  }

  public async deleteTeachingTranslation(teachingPathId: number, localeId: number) {
    return this.teachingPathRepo.deleteTeachingTranslation(teachingPathId, localeId);
  }

  public async getTeachingPathListOfStudentInList(studentId: number, filter: Filter) {
    return this.teachingPathRepo.getTeachingPathListOfStudentInList(studentId, filter);
  }

  public async downloadTeacherGuidancePDF(id: number) {
    return this.teachingPathRepo.downloadTeacherGuidancePDF(id);
  }

  public async getLocalesByApi() {
    return this.teachingPathRepo.getLocalesByApi();
  }
}
