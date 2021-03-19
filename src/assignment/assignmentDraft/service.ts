import { injector } from 'Injector';
import {
  DraftAssignment,
  DraftAssignmentRepo,
  DRAFT_ASSIGNMENT_REPO
} from 'assignment/assignmentDraft/AssignmentDraft';

export const DRAFT_ASSIGNMENT_SERVICE = 'DRAFT_ASSIGNMENT_SERVICE';

export class DraftAssignmentService {

  protected draftAssignmentRepo: DraftAssignmentRepo = injector.get<DraftAssignmentRepo>(DRAFT_ASSIGNMENT_REPO);

  protected draftAssignment: DraftAssignment | null = null;

  private getAssignment(): DraftAssignment {
    return this.draftAssignment!;
  }

  public async getDraftAssignmentForEditing(id: number): Promise<DraftAssignment> {
    this.draftAssignment = await this.draftAssignmentRepo.getDraftAssignmentById(id);
    return this.getAssignment();
  }

  public async getNewAssignment(): Promise<DraftAssignment> {
    this.draftAssignment = await this.draftAssignmentRepo.getNewAssignment();
    return this.getAssignment();
  }

  public async saveAttachment(assignmentId: number, attachmentId: number) {
    return this.draftAssignmentRepo.saveAttachment(assignmentId, attachmentId);
  }

  public async removeAttachment(assignmentId: number, attachmentId: number) {
    return this.draftAssignmentRepo.removeAttachment(assignmentId, attachmentId);
  }

}
