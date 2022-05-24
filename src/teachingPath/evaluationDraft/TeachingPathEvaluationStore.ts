import { action, computed, observable } from 'mobx';
import isNull from 'lodash/isNull';
import isNil from 'lodash/isNil';
import intl from 'react-intl-universal';

import { injector } from 'Injector';
import { USER_SERVICE, UserService } from 'user/UserService';
import { TEACHING_PATH_EVALUATION_SERVICE, TeachingPathEvaluationService } from 'evaluation/service';
import { EditableEvaluation, EvaluationAnswer, TeachingPathAnswersList } from 'evaluation/Evaluation';

import { debounce } from 'utils/debounce';
import { SAVE_DELAY, SHOW_MESSAGE_DELAY, STATUS_FORBIDDEN } from 'utils/constants';
import { Locales, StoreState } from 'utils/enums';
import { TeachingPath, TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { DRAFT_TEACHING_PATH_SERVICE, DraftTeachingPathService } from 'teachingPath/teachingPathDraft/service';
import { ArticleService } from 'assignment/service';
import { Article, ARTICLE_SERVICE_KEY } from 'assignment/Assignment';
import {
  EvaluateTeachingPathNode,
  EvaluateTeachingPathNodeArticleItem,
  EvaluateTeachingPathNodeAssignmentItem,
  StudentTeachingPathEvaluationNodeItem,
  StudentTeachingPathAnswer
} from '../../evaluation/api';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { EvaluationValidationError } from 'assignment/EvaluationDraft/AssignmentEvaluationStore';
import { StudentTeachingPathNodeResponseDTO } from 'teachingPath/api';

const passedMark = 2;

export interface EvaluationStep {
  nodeId: number;
  type: string;
  items: Array<EvaluateTeachingPathNodeAssignmentItem | EvaluateTeachingPathNodeArticleItem>;
  assignmentAnswers: EvaluationAnswer | undefined;
}

export interface StudentEvaluationStep {
  nodeId: number;
  type: TeachingPathNodeType;
  items: Array<StudentTeachingPathEvaluationNodeItem>;
  title: string;
  assignmentAnswers?: EvaluationAnswer;
}

export class TeachingPathEvaluationStore {

  @computed
  public get currentLocale() {
    return this.userService.getCurrentLocale() || Locales.EN;
  }

  @computed
  public get evaluationSteps() {
    return this._evaluationSteps;
  }

  @computed
  public get displaySaveMessage() {
    return this._displaySaveMessage;
  }

  @computed
  public get evaluationAnswers() {
    return this._evaluationAnswers;
  }

  @computed
  public get evaluationCurrentPage() {
    return this.teachingPathAnswersListService.filter.page;
  }

  private userService: UserService = injector.get(USER_SERVICE);
  private evaluationService: TeachingPathEvaluationService = injector.get<TeachingPathEvaluationService>(TEACHING_PATH_EVALUATION_SERVICE);
  private draftTeachingPathService: DraftTeachingPathService = injector.get<DraftTeachingPathService>(DRAFT_TEACHING_PATH_SERVICE);
  private teachingPathAnswersListService: TeachingPathAnswersList = new TeachingPathAnswersList();
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);
  @observable private _evaluationAnswers: EvaluationAnswer | undefined = undefined;

  @observable public answersList: Array<EditableEvaluation> = [];
  @observable public paginationTotalPages: number = 1;
  @observable public currentEvaluation: EditableEvaluation | null = null;
  @observable public currentEntity: TeachingPath | null = null;
  @observable public _displaySaveMessage: boolean = false;
  @observable public studentEvaluation: StudentTeachingPathAnswer | null = null;

  @observable public answersListState = StoreState.PENDING;
  @observable public currentEntityState = StoreState.PENDING;

  @observable public relatedArticlesState: StoreState = StoreState.PENDING;
  @observable public relatedArticles: Array<Article> = [];

  @observable public _evaluationSteps: Array<EvaluationStep> = [];
  @observable public studentEvaluationSteps: Array<StudentEvaluationStep> = [];

  public save = debounce(this.saveEvaluation, SAVE_DELAY);

  @action
  public async getAnswersList(id: number) {
    this.answersListState = StoreState.LOADING;
    const response = await this.teachingPathAnswersListService.getTeachingPathAnswersList(id);
    this.answersList = response.answersList;
    this.paginationTotalPages = response.total_pages;

    this.answersListState = StoreState.PENDING;
  }

  @action
  public async getCurrentEntity(id: number) {
    this.currentEntityState = StoreState.LOADING;
    this.currentEntity = (await this.draftTeachingPathService.getDraftForeignTeachingPathById(id)).teachingPath;
    this.currentEntityState = StoreState.PENDING;
  }

  @action
  public showSaveMessage = () => {
    this._displaySaveMessage = true;
    setTimeout(() => this._displaySaveMessage = false, SHOW_MESSAGE_DELAY);
  }

  public async saveEvaluation() {
    await this.evaluationService.saveEvaluation(this.currentEntity!.id, this.currentEvaluation!.answerId, this.currentEvaluation!);
    this.showSaveMessage();
  }

  @action
  public calcPassedStatus() {
    return this.currentEvaluation && !isNull(this.currentEvaluation.mark) && this.currentEvaluation.mark >= passedMark;
  }

  @action
  public setCurrentEvaluation(id?: number) {
    if (id) {
      return this.currentEvaluation = this.answersList.find(item => item.answerId === id)!;
    }
    return this.currentEvaluation = null;
  }

  @action
  public getAnswersByPage(page: number, id: number) {
    this.teachingPathAnswersListService.setFiltersPage(page);
    this.getAnswersList(id);
  }

  @action
  public setMark(mark: number | null) {
    if (this.currentEvaluation) {
      this.currentEvaluation.setMark(mark);
      const isPassed = this.calcPassedStatus();
      if (isNull(mark)) {
        this.currentEvaluation.setPassedStatus(null);
      } else if (!isNil(isPassed)) {
        this.currentEvaluation.setPassedStatus(isPassed);
      }
      this.saveEvaluation();
    }
  }

  @action
  public setStatus(status: boolean | null) {
    if (this.currentEvaluation) {
      this.currentEvaluation.setStatus(status);
      this.saveEvaluation();
    }
  }

  @action
  public resetCurrentEntity = () => {
    this._evaluationSteps = [];
  }

  @action
  public setCommentToEntity(comment: string) {
    if (this.currentEvaluation) {
      this.currentEvaluation.setCommentToEntity(comment);
      this.save();
    }
  }

  @action
  public setCommentToAnswer(comment: string, questionId: number) {
    if (this.currentEvaluation) {
      this.currentEvaluation.setCommentToAnswer(comment, questionId);
      this.save();
    }
  }

  @action
  public getDraftAnswersById = async () => {
    if (this.currentEvaluation) {
      const {
        uuid,
        commentToEntity,
        commentsToAnswers
      } = await this.evaluationService.getDraftAnswersById(this.currentEntity!.id, this.currentEvaluation!.answerId);
      this.currentEvaluation.setUuid(uuid);
      if (!isNull(commentToEntity)) {
        this.currentEvaluation.setCommentToEntity(commentToEntity);
      }
      if (!isNull(commentsToAnswers)) {
        commentsToAnswers.forEach(answer => this.currentEvaluation!.setCommentToAnswer(answer.comment, answer.questionAnswerId));
      }
    }
  }

  @action
  public getAnswersById = async () => {
    const response = await this.evaluationService.getAnswersById(this.currentEntity!.id, this.currentEvaluation!.answerId);

    const steps = [];
    let parentChildren: Array<EvaluateTeachingPathNode> = [];

    for (const node of response.path) {
      const nodeInfo = await this.evaluationService!.getNodeById(node, this.currentEntity!.id);

      if (nodeInfo.type === 'ASSIGNMENT') {
        const selectedAssignment = response.selectedAssignments.find(item => item.node_id === node);
        if (selectedAssignment && selectedAssignment.assignment_id) {
          const assignmentAnswers = response.assignmentAnswers.find(item => item.assignmentId === selectedAssignment.assignment_id);

          const items: Array<EvaluateTeachingPathNodeAssignmentItem> = [];
          if (parentChildren.length) {
            parentChildren.forEach((child) => {
              if (child.items.length) {
                const assignmentItems = child.items as Array<EvaluateTeachingPathNodeAssignmentItem>;
                assignmentItems.forEach((item: EvaluateTeachingPathNodeAssignmentItem) => {
                  if (item.id === nodeInfo.items[0].id) {
                    item.isSelected = true;
                  }
                  items.push(item);
                });
              }
            });
          }

          steps.push({
            items,
            assignmentAnswers: assignmentAnswers!,
            nodeId: node,
            type: nodeInfo.type
          });
        }
      }

      if (nodeInfo.type === 'ARTICLE') {
        const wpIds: Array<number> = [];
        parentChildren.forEach(child => child.items.forEach((item) => {
          const articleItem = item as EvaluateTeachingPathNodeArticleItem;
          wpIds.push(Number(articleItem.wpId));
        }));

        const selectedArticle = (response.selectedArticles) ? response.selectedArticles.find(item => item.node_id === node) : null;
        let selectedWpId: number;

        if (selectedArticle && selectedArticle.article_id) {
          const t = nodeInfo.items.find(item => item.id === selectedArticle.article_id)! as EvaluateTeachingPathNodeArticleItem;
          selectedWpId = t.wpId!;
        }

        if (wpIds.length) {
          const articles = await this.articleService.getArticlesByIds(wpIds);
          const articleInfo: Array<EvaluateTeachingPathNodeArticleItem> = articles.map((article: Article) => {
            let selectedArticleInfo: {wpId?: number, level?: number} = { level: undefined, wpId: undefined };
            if (selectedArticle) {
              parentChildren.forEach(child => child.items.find((item) => {
                if (item.id === selectedArticle.article_id) {
                  const articleItem = item as EvaluateTeachingPathNodeArticleItem;
                  return selectedArticleInfo = {
                    wpId: articleItem.wpId,
                    level: selectedArticle.level
                  };
                }
                return null;
              }));
            }
            const level = (selectedArticleInfo.level && selectedArticleInfo.wpId ===  article.id)
              ? selectedArticleInfo.level
              : Number(article.levels![0].slug.split('-')[1]);
            return ({
              isSelected: !!(selectedWpId && (selectedWpId === article.id)),
              title: article.title,
              featuredImage: article.images && article.images.url,
              id: article.id,
              levels: level
            });
          });

          steps.push({
            items: articleInfo,
            nodeId: node,
            type: nodeInfo.type,
            assignmentAnswers: undefined
          });
        }
      }

      if (nodeInfo.type === 'DOMAIN') {
        const domainInfo = nodeInfo.items;
        steps.push({
          items: domainInfo,
          nodeId: node,
          type: nodeInfo.type,
          assignmentAnswers: undefined
        });
      }

      parentChildren = nodeInfo.children;
    }
    this._evaluationSteps = steps;
  }

  @action
  public async getRelatedArticles() {
    try {
      this.relatedArticlesState = StoreState.LOADING;

      const ids = this._evaluationAnswers!.readArticleData.map(article => article.wpId!);
      if (ids && ids.length) {
        const articles = await this.articleService.getArticlesByIds(ids);

        const allArticles = this._evaluationAnswers!.readArticleData.map((article) => {
          const fullArticle = articles.find(item => item.id === article.wpId!);
          return {
            ...article,
            ...fullArticle,
            readLevel: article.readLevel,
          };
        });

        this.relatedArticlesState = StoreState.PENDING;
        return this.relatedArticles = allArticles;
      }

      this.relatedArticlesState = StoreState.PENDING;
      return this.relatedArticles = [];
    } catch (e) {
      this.relatedArticlesState = StoreState.ERROR;
      throw Error(`fetch related articles: ${e}`);
    }
  }

  @action
  public publishEvaluation = async () => {
    try {
      if (isNull(this.currentEvaluation!.mark) && isNull(this.currentEvaluation!.isPassed)) {
        return Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('answers.validation.markOrStatus')
        });
      }
      await this.evaluationService.publishEvaluation(this.currentEntity!.id, this.currentEvaluation!.answerId, this.currentEvaluation!);
    } catch (error) {
      if (error.response && error.response.status === STATUS_FORBIDDEN) {
        return Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('answers.validation.deadline')
        });
      }
      if (error instanceof EvaluationValidationError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('answers.validation.mark')
        });
      } else {
        console.error('Error while saving publish:', error.message);
      }
    }
  }

  public async getEvaluationForStudent(teachingPathId: number, answerId: number) {
    const response = await this.evaluationService.getEvaluationForStudent(teachingPathId, answerId);
    this.studentEvaluation = response;

    response.path.shift();

    const steps = [];
    let currentPathIndex = 0;
    let currentNode: StudentTeachingPathNodeResponseDTO = response.revisionContent.content.children.find(
      node => node.id === response.path[currentPathIndex]
    )!;
    let parentNode = response.revisionContent.content;

    const generateEvaluationStep = async () => {
      parentNode = currentNode;
      currentNode = parentNode.children.find(node => node.id === response.path[currentPathIndex])!;
      currentPathIndex = currentPathIndex + 1;

      const qwe = currentNode.type === TeachingPathNodeType.Assignment ?
      response.assignmentAnswers.find(
        answer => answer.assignmentId === response.selectedAssignments.find(assignment => assignment.node_id === currentNode.id)!.assignment_id
      ) :
      undefined;

      steps.push({
        title: currentNode.selectQuestion,
        nodeId: currentNode.id!,
        type: currentNode.type,
        items: parentNode.children.map(node => node.items.map(
          item => ({
            ...item,
            isSelected: currentNode.type === TeachingPathNodeType.Assignment ?
              !!response.selectedAssignments.find(assignment => (assignment.assignment_id === item.id && assignment.node_id === node.id)) :
              !!response.selectedArticles.find(article => (article.article_id === item.id && article.node_id === node.id)),
            levels: currentNode.type === TeachingPathNodeType.Assignment ?
              item.levels :
            [response.selectedArticles.find(article => article.article_id === item.id) &&
              response.selectedArticles.find(article => article.article_id === item.id)!.level],
            featuredImage: item.featuredImage
          }),
        )).flat(),
        assignmentAnswers: currentNode.type === TeachingPathNodeType.Assignment ?
        {
          assignmentId: qwe!.assignmentId!,
          ...qwe,
        } :
          undefined
      });

      if (currentNode.children && currentNode.children.length > 0) {
        generateEvaluationStep();
      }
    };

    const assignmentAnswers = currentNode.type === TeachingPathNodeType.Assignment ?
      response.assignmentAnswers.find(
        answer => answer.assignmentId === response.selectedAssignments.find(assignment => assignment.node_id === currentNode.id)!.assignment_id
      ) :
      undefined;

    currentPathIndex = currentPathIndex + 1;
    steps.push({
      title: currentNode.selectQuestion || '',
      nodeId: currentNode.id!,
      type: currentNode.type,
      items: parentNode.children.map(node => node.items.map(
        item => ({
          ...item,
          isSelected: currentNode.type === TeachingPathNodeType.Assignment ?
            !!response.selectedAssignments.find(assignment => (assignment.assignment_id === item.id && assignment.node_id === node.id)) :
            !!response.selectedArticles.find(article => (article.article_id === item.id && article.node_id === node.id)),
          levels: currentNode.type === TeachingPathNodeType.Assignment ?
            item.levels :
            [response.selectedArticles.find(article => article.article_id === item.id) &&
              response.selectedArticles.find(article => article.article_id === item.id)!.level],
          featuredImage: item.featuredImage
        }),
      )).flat(),
      assignmentAnswers: currentNode.type === TeachingPathNodeType.Assignment ?
        {
          assignmentId: assignmentAnswers!.assignmentId!,
          ...assignmentAnswers,
        } :
        undefined
    });

    if (currentNode.children.length) {
      generateEvaluationStep();
    }

    const articlesWpIds = steps.map(
      step => step.type === TeachingPathNodeType.Article && step.items.map(item => item.wpId)
    )
    .flat()
    .filter(Boolean);

    const fetchedArticles = await this.articleService.getArticlesByIds(articlesWpIds);

    this.studentEvaluationSteps = steps.map(step => (
      step.type === TeachingPathNodeType.Article ? {
        ...step,
        items: step.items.map(item => ({
          ...item,
          featuredImage: fetchedArticles.find(article => article.id === item.wpId)!.images!.url,
          levels: item.levels[0]
            ? item.levels
            : [Number(fetchedArticles.find(article => article.id === item.wpId)!.levels![0].slug.split('-')[1])]
        }))
      } : step
    )) as Array<StudentEvaluationStep>;
  }

  @action
  public clearStudentEvaluation() {
    this.studentEvaluationSteps = [];
    this.studentEvaluation = null;
  }
}
