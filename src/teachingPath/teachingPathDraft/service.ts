import { Keyword } from 'assignment/Assignment';
import { injector } from 'Injector';

import { DraftTeachingPath, DraftTeachingPathRepo, DRAFT_TEACHING_PATH_REPO } from './TeachingPathDraft';

export const DRAFT_TEACHING_PATH_SERVICE = 'DRAFT_TEACHING_PATH_SERVICE';

const TEMPORAL = 67933;

export class DraftTeachingPathService {

  protected draftTeachingPathRepo: DraftTeachingPathRepo = injector.get(DRAFT_TEACHING_PATH_REPO);

  protected draftTeachingPath: DraftTeachingPath | null = null;

  public async createTeachingPath() {
    this.draftTeachingPath = await this.draftTeachingPathRepo.createTeachingPath();
    return this.draftTeachingPath;
  }

  public async getKeywordsFromArticles(arrayArticlesIds: Array<number>, arrayAsignmentsIds: Array<number>): Promise<Array<Keyword>> {
    const keywords = await this.draftTeachingPathRepo.getKeywordsFromArticles(arrayArticlesIds, arrayAsignmentsIds);
    const entityKeywordsArray: Array<Keyword> = [];
    /* if (keywords!) { */
    keywords!.forEach((item) => {
      entityKeywordsArray.push(new Keyword(item));
    });
    return entityKeywordsArray;
    /* }
    return []; */
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
