import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { Distribution } from 'distribution/Distribution';

interface AssingmentContainerArgs {
  assignment: DraftAssignment;
  distribution?: Distribution;
}

export class AssignmentContainer {

  public assignment: DraftAssignment;
  public distribution: Distribution | null;

  constructor(args: AssingmentContainerArgs) {
    this.assignment = args.assignment;
    this.distribution = args.distribution || null;
  }

}
