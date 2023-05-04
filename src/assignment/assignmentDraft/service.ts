import { injector } from 'Injector';
import {
  DraftAssignment,
  DraftAssignmentRepo,
  DRAFT_ASSIGNMENT_REPO
} from 'assignment/assignmentDraft/AssignmentDraft';
import { Keyword } from 'assignment/Assignment';

export const DRAFT_ASSIGNMENT_SERVICE = 'DRAFT_ASSIGNMENT_SERVICE';

const TEMPORAL = 67933;

export class DraftAssignmentService {

  protected draftAssignmentRepo: DraftAssignmentRepo = injector.get<DraftAssignmentRepo>(DRAFT_ASSIGNMENT_REPO);

  protected draftAssignment: DraftAssignment | null = null;

  private getAssignment(): DraftAssignment {
    return this.draftAssignment!;
  }

  public async getDraftAssignmentForEditing(id: number, localeid?: number): Promise<DraftAssignment> {
    this.draftAssignment = await this.draftAssignmentRepo.getDraftAssignmentById(id, localeid);
    return this.getAssignment();
  }

  public async getNewAssignment(): Promise<DraftAssignment> {
    this.draftAssignment = await this.draftAssignmentRepo.getNewAssignment();
    return this.getAssignment();
  }

  public async getKeywordsFromArticles(arrayWpIds: Array<number>): Promise<Array<Keyword>> {
    const keywords = await this.draftAssignmentRepo.getKeywordsFromArticles(arrayWpIds);
    const entityKeywordsArray: Array<Keyword> = [];
    keywords.forEach((item) => {
      entityKeywordsArray.push(new Keyword(item));
    });
    return entityKeywordsArray;
  }

  public async saveAttachment(assignmentId: number, attachmentId: number) {
    return this.draftAssignmentRepo.saveAttachment(assignmentId, attachmentId);
  }

  public async removeAttachment(assignmentId: number, attachmentId: number) {
    return this.draftAssignmentRepo.removeAttachment(assignmentId, attachmentId);
  }

}
