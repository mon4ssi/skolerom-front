import { DraftTeachingPath } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { Distribution } from 'distribution/Distribution';

interface TeachingPathContainerArgs {
  teachingPath: DraftTeachingPath;
  distribution?: Distribution;
}

export class TeachingPathContainer {

  public teachingPath: DraftTeachingPath;
  public distribution: Distribution | null;

  constructor(args: TeachingPathContainerArgs) {
    this.teachingPath = args.teachingPath;
    this.distribution = args.distribution || null;
  }

}
