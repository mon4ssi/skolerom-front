import { injector } from 'Injector';

import { DraftTeachingPath, DraftTeachingPathRepo, DRAFT_TEACHING_PATH_REPO } from './TeachingPathDraft';

export const DRAFT_TEACHING_PATH_SERVICE = 'DRAFT_TEACHING_PATH_SERVICE';

export class DraftTeachingPathService {

  protected draftTeachingPathRepo: DraftTeachingPathRepo = injector.get(DRAFT_TEACHING_PATH_REPO);

  protected draftTeachingPath: DraftTeachingPath | null = null;

  public async createTeachingPath() {
    this.draftTeachingPath = await this.draftTeachingPathRepo.createTeachingPath();
    return this.draftTeachingPath;
  }

  public getDraftForeignTeachingPathById = (id: number) =>
    this.draftTeachingPathRepo.getDraftForeignTeachingPathById(id)

  public getDraftTeachingPathById = async (id: number) => {
    this.draftTeachingPath = await this.draftTeachingPathRepo.getDraftTeachingPathById(id);
    return this.draftTeachingPath;
  }

  public deleteTeachingPath = async (id: number) => {
    await this.draftTeachingPathRepo.deleteTeachingPath(id);
  }

}
