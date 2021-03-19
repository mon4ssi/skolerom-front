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
} from './Assignment';
import { Locales } from 'utils/enums';

export const ASSIGNMENT_SERVICE = 'ASSIGNMENT_SERVICE';

export class AssignmentService {

  protected assignmentRepo: AssignmentRepo = injector.get<AssignmentRepo>(ASSIGNMENT_REPO);

  public async getGrades() {
    return this.assignmentRepo.getGrades();
  }

  public async getSubjects() {
    return this.assignmentRepo.getSubjects();
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

  public async getMyAssignmentsList(filter: Filter) {
    return this.assignmentRepo.getMyAssignmentsList(filter);
  }

  public async getStudentAssignmentList(filter: Filter) {
    return this.assignmentRepo.getStudentAssignmentList(filter);
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
}

export class ArticleService {
  private articleRepo: ArticleRepo = injector.get(ARTICLE_REPO_KEY);

  public async getArticles(params?: {
    page: number,
    perPage: number,
    order?: string,
    grades?: number,
    subjects?: number,
    searchTitle?: string
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

  public async getLocaleData(locale: Locales): Promise<Array<WPLocale>> {
    return this.articleRepo.getLocaleData(locale);
  }
}
