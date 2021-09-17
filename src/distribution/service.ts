import { injector } from 'Injector';
import { DISTRIBUTION_REPO, DistributionRepo, Distribution } from './Distribution';

export const DISTRIBUTION_SERVICE = 'DISTRIBUTION_SERVICE';

export class DistributionService {

  protected distributionRepo: DistributionRepo = injector.get(DISTRIBUTION_REPO);
  protected distribution: Distribution | null = null;

  private getDistribution() {
    return this.distribution!;
  }

  public async getAssignmentDistributionData(id: number) {
    this.distribution = await this.distributionRepo.getAssignmentDistributionData(id);

    return this.getDistribution();
  }

  public async getTeachingPathDistributionData(id: number) {
    this.distribution = await this.distributionRepo.getTeachingPathDistributionData(id);
    return this.getDistribution();
  }

  public async assignStudentToAssignment(assignmentId: string, referralToken: string) {
    return this.distributionRepo.assignStudentToAssignment(assignmentId, referralToken);
  }

  public async assignStudentToTeachingPath(teachingPathId: string, referralToken: string) {
    return this.distributionRepo.assignStudentToTeachingPath(teachingPathId, referralToken);
  }
}
