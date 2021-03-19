import { injector } from 'Injector';
import { QUESTIONARY_REPO, QuestionaryRepo, Questionary } from './Questionary';

export const QUESTIONARY_SERVICE = 'QUESTIONARY_SERVICE';

export class QuestionaryService {

  protected questionaryRepo: QuestionaryRepo = injector.get<QuestionaryRepo>(QUESTIONARY_REPO);
  protected questionary: Questionary | null = null;

  private getQuestionary(): Questionary {
    return this.questionary!;
  }

  public async getNewQuestionaryByAssignmentId(id: number): Promise<Questionary> {
    this.questionary = await this.questionaryRepo.getNewQuestionaryByAssignmentId(id);
    return this.getQuestionary();
  }

  public async getNewQuestionaryByAssignmentIdFromTeachingPath(id: number, redirectData: {teachingPath: number, node: number}): Promise<Questionary> {
    this.questionary = await this.questionaryRepo.getNewQuestionaryByAssignmentIdFromTeachingPath(id, redirectData);
    return this.getQuestionary();
  }

  public async setReadStatusArticle(assignmentId: number, revisionId: number, articleId: number, levelId: number, graduation: number) {
    this.questionaryRepo.setReadStatusArticle(assignmentId, revisionId, articleId, levelId, graduation);
  }

  public async deleteQuestionary() {
    this.questionaryRepo.deleteQuestionary(this.questionary!);
  }

  public async revertQuestionary() {
    this.questionary = await this.questionaryRepo.revertQuestionary(this.questionary!);
    return this.questionary;
  }

  public async getAssignmentQuestionaryById(id: number) {
    this.questionary = await this.questionaryRepo.getAssignmentQuestionaryById(id);
    return this.getQuestionary();
  }
}
