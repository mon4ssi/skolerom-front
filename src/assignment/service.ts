import { injector } from 'Injector';
import {
  AssignmentRepo,
  ArticleRepo,
  Article,
  Attachment,
  Filter,
  ASSIGNMENT_REPO,
  ARTICLE_REPO_KEY,
  WPLocale,
  CustomImgAttachment,
} from './Assignment';
import { Locales } from 'utils/enums';
import { CustomImage } from './view/NewAssignment/AttachmentsList/CustomImageForm/CustomImageForm';
import { createContext } from 'react';
import { CustomImgAttachmentResponse, ResponseFetchCustomImages } from './api';

export const ASSIGNMENT_SERVICE = 'ASSIGNMENT_SERVICE';

export class AssignmentService {

  protected assignmentRepo: AssignmentRepo = injector.get<AssignmentRepo>(ASSIGNMENT_REPO);

  public async getGrades() {
    return this.assignmentRepo.getGrades();
  }

  public async getSubjects() {
    return this.assignmentRepo.getSubjects();
  }

  public async getSources() {
    return this.assignmentRepo.getSources();
  }

  public async removeAssignment(assignmentId: number) {
    return this.assignmentRepo.removeAssignment(assignmentId);
  }

  public async getAssignmentById(assignmentId: number) {
    return this.assignmentRepo.getAssignmentById(assignmentId);
  }

  public async getAllAssignmentsList(filter: Filter) {
    return this.assignmentRepo.getAllAssignmentsList(filter);
  }

  public async getAllSchoolAssignmentsList(filter: Filter) {
    return this.assignmentRepo.getAllSchoolAssignmentsList(filter);
  }

  public async getMyAssignmentsList(filter: Filter) {
    return this.assignmentRepo.getMyAssignmentsList(filter);
  }

  public async getStudentAssignmentList(filter: Filter) {
    return this.assignmentRepo.getStudentAssignmentList(filter);
  }

  public async getGrepFiltersAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string) {
    return this.assignmentRepo.getGrepFiltersAssignment(locale, grades, subjects, coreElements, goals);
  }

  public async getGrepFiltersMyAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string) {
    return this.assignmentRepo.getGrepFiltersMyAssignment(locale, grades, subjects, coreElements, goals);
  }

  public async getGrepFiltersMySchoolAssignment(locale: string, grades: string, subjects: string, coreElements?: string, goals?: string) {
    return this.assignmentRepo.getGrepFiltersMySchoolAssignment(locale, grades, subjects, coreElements, goals);
  }

  public async getAssignmentListOfStudentInList(studentId: number, filter: Filter) {
    return this.assignmentRepo.getAssignmentListOfStudentInList(studentId, filter);
  }

  public async getAssignmentDistributes(filter: Filter) {
    return this.assignmentRepo.getAssignmentDistributes(filter);
  }

  public async copyAssignment(id: number) {
    return this.assignmentRepo.copyAssignment(id);
  }

  public async downloadTeacherGuidancePDF(id: number) {
    return this.assignmentRepo.downloadTeacherGuidancePDF(id);
  }
}

export class ArticleService {
  private articleRepo: ArticleRepo = injector.get(ARTICLE_REPO_KEY);

  public async getArticles(params?: {
    page: number,
    perPage: number,
    order?: string,
    grades?: number,
    subjects?: number,
    core?: number | string,
    goal?: number | string,
    multi?: number,
    source?: number,
    searchTitle?: string,
    lang?: string
  }): Promise<Array<Article>> {

    return this.articleRepo.getArticles(params);
  }

  public async getArticlesByIds(ids: Array<number>): Promise<Array<Article>> {
    return this.articleRepo.getArticlesByIds(ids);
  }

  public async fetchVideos(postIds: Array<number>): Promise<Array<Attachment>> {
    return this.articleRepo.fetchVideos(postIds);
  }

  public async fetchImages(postIds: Array<number>): Promise<Array<Attachment>> {
    return this.articleRepo.fetchImages(postIds);
  }

  public async fetchCoverImages(postIds: Array<number>): Promise<Array<Attachment>> {
    return this.articleRepo.fetchCoverImages(postIds);
  }

  public async fetchCustomImages(ids:string, page: number): Promise<ResponseFetchCustomImages> {
    return this.articleRepo.fetchCustomImages(ids, page);
  }

  public async createCustomImage(fd: FormData): Promise<CustomImgAttachmentResponse> {
    return this.articleRepo.createCustomImage(fd);
  }

  public async deleteCustomImage(imageId: number): Promise<any> {
    return this.articleRepo.deleteCustomImage(imageId);
  }

  public async updateCustomImage(customImageId: number, formData: FormData): Promise<any> {
    return this.articleRepo.updateCustomImage(customImageId, formData);
  }

  public async increaseUse(imageId: number): Promise<any> {
    return this.articleRepo.increaseUse(imageId);
  }
  public async decreaseUse(imageId: number): Promise<any> {
    return this.articleRepo.decreaseUse(imageId);
  }

  public async getLocaleData(locale: Locales): Promise<Array<WPLocale>> {
    return this.articleRepo.getLocaleData(locale);
  }
}
