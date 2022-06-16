import { action, computed, observable } from 'mobx';
import { TeachingPath, TeachingPathNode, TeachingPathNodeType, TeachingPathsList } from '../TeachingPath';
import { Article, ARTICLE_SERVICE_KEY, Assignment, Domain } from '../../assignment/Assignment';
import { ArticleService } from '../../assignment/service';
import { injector } from '../../Injector';
import { TEACHING_PATH_SERVICE, TeachingPathService } from '../service';
import isNull from 'lodash/isNull';
import * as Sentry from '@sentry/react';

export enum SubmitNodeType {
  Submit = 'Submit'
}

export class QuestionaryTeachingPathStore {

  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);
  private teachingPathService = injector.get<TeachingPathService>(TEACHING_PATH_SERVICE);
  private listTeachingPaths = new TeachingPathsList();

  @observable public currentTeachingPath: TeachingPath | null = null;
  @observable public currentArticlesList: Array<Article> = [];
  @observable public currentAssignmentList: Array<Assignment> = [];
  @observable public currentDomainList: Array<Domain> = [];
  @observable public currentNode: TeachingPathNode | null = null;
  @observable public pickedItemArticle: {idNode: number, item: Article} | undefined = undefined;
  @observable public pickedItemAssignment: {idNode: number, item: Assignment} | undefined = undefined;
  @observable public pickedItemDomain: {idNode: number, item: Domain} | undefined = undefined;
  @observable public fetchingData: boolean = false;
  @observable public isOpenIframe: boolean = false;
  @observable public isOpenAssignment: boolean = false;
  @observable public currentDisplayedElement: TeachingPathNodeType | SubmitNodeType = TeachingPathNodeType.Root;

  @computed
  public get isFetchingData() {
    return this.fetchingData;
  }

  @computed
  public get isOpenedIframe() {
    return this.isOpenIframe;
  }

  @computed
  public get isOpenedAssignment() {
    return this.isOpenAssignment;
  }

  @computed
  public get displayedElement() {
    return this.currentDisplayedElement;
  }

  @computed
  public get selectedTeachingPath() {
    return this.currentTeachingPath;
  }

  @computed
  public get currentNodeType() {
    if (this.currentNode) {
      return this.currentNode.type;
    }
    return null;
  }

  @computed
  public get redirectData() {
    return {
      teachingPath: this.currentTeachingPath!.id,
      node: this.currentNode!.id
    };
  }

  @computed
  public get teachingPathId() {
    return this.currentTeachingPath && this.currentTeachingPath.id;
  }

  @computed
  public get rootNodeId() {
    return this.currentTeachingPath!.rootNodeId;
  }

  @computed
  public get childrenType() {
    if (this.currentNode!.children.length > 0) {
      return this.currentNode!.children[0].type;
    }
    return undefined;
  }

  @computed
  public get childrenDomainType() {
    if (this.currentNode!.children[0].children.length > 0) {
      return this.currentNode!.children[0].children[0].type;
    }
    return undefined;
  }

  @computed
  public get currentListAssignment() {
    return this.currentAssignmentList;
  }

  @computed
  public get idsItemsNode() {
    const ids: Array<number> = [];
    this.currentNode!.children.forEach(child => child.items && child.items.forEach((i) => {
      const article = i.value as Article;
      return article.wpId && ids.push(article.wpId);
    }));
    return ids;
  }

  @action
  public setCurrentDisplayedElement(element: TeachingPathNodeType | SubmitNodeType) {
    this.currentDisplayedElement = element;
  }

  @action
  public handleIframe(status: boolean) {
    this.isOpenIframe = status;
  }

  @action
  public handleAssignment(status: boolean) {
    this.isOpenAssignment = status;
  }

  @action
  public resetAllInfoAboutTeachingPath() {
    this.currentTeachingPath = null;
    this.currentArticlesList = [];
    this.currentDomainList = [];
    this.currentAssignmentList = [];
    this.currentNode = null;
    this.pickedItemArticle = undefined;
    this.pickedItemAssignment = undefined;
    this.pickedItemDomain = undefined;
    this.fetchingData = false;
    this.isOpenIframe = false;
    this.isOpenAssignment = false;
    this.currentDisplayedElement = TeachingPathNodeType.Root;
  }

  @action
  public resetCurrentNode() {
    this.currentNode = null;
  }

  @action
  public resetCurrentTeachingPath() {
    this.currentTeachingPath = null;
  }

  @action
  public setFetchingDataStatus(status: boolean) {
    this.fetchingData = status;
  }

  @action
  public resetCurrentArticleList() {
    this.currentArticlesList = [];
  }

  @action
  public resetCurrentDomainList() {
    this.currentDomainList = [];
  }

  @action
  public resetCurrentAssignmentList() {
    this.currentAssignmentList = [];
  }

  @action
  public finishTeachingPath() {
    this.teachingPathService.finishTeachingPath(this.currentTeachingPath!.id);
  }

  @action
  public async deleteTeachingPathAnswers() {
    if (this.currentTeachingPath!.answerId) {
      await this.teachingPathService.deleteTeachingPathAnswers(this.currentTeachingPath!.id, this.currentTeachingPath!.answerId);
    } else {
      Sentry.captureException(new Error(`Can't delete answers for ${this.currentTeachingPath!.id}`), { extra: { URL: window.location.href } });
    }
  }

  @action
  public async markAsPickedArticle(graduation: number) {
    const pickedItem = this.currentArticlesList.find(i => i.id === this.pickedItemArticle!.item.id);

    if (pickedItem && pickedItem.levels) {
      await this.teachingPathService.markAsPickedArticle(
        this.currentTeachingPath!.id,
        this.pickedItemArticle!.idNode,
        this.pickedItemArticle!.item.id,
        graduation
      );
    }
  }

  @action
  public setPickedItemArticle(idNode: number, item: Article) {
    this.pickedItemArticle = { idNode, item };
  }

  @action
  public pickUpItem (idItem: number) {
    this.currentNode!.children.forEach((child) => {
      if (child.items) {
        return child.items.some((i) => {
          if (i.type === TeachingPathNodeType.Article) {
            const article = i.value as Article;
            if (article.id === idItem) {
              this.pickedItemArticle = { idNode: child.id!, item: this.currentArticlesList.find(el => el.id === article.id)! };
            }
            return null;
          }
          if (i.type === TeachingPathNodeType.Assignment) {
            const assignment = i.value as Assignment;
            if (assignment.id === idItem) {
              this.pickedItemAssignment = { idNode: child.id!, item: new Assignment(assignment) };
            }
            return null;
          }
          if (i.type === TeachingPathNodeType.Domain) {
            const domain = i.value as Domain;
            if (domain.id === idItem) {
              this.pickedItemDomain = { idNode: child.id!, item: new Domain(domain) };
              domain.isRead = true;
            }
            return null;
          }
          return null;
        });
      }
      return null;
    });
  }

  @action
  public clearAssignmentFullInfo() {
    this.currentAssignmentList = [];
  }

  @action
  public assignmentFullInfo() {
    this.currentNode!.children.forEach((child) => {
      if (child.items) {
        return child.items.forEach((item) => {
          if (item.type === TeachingPathNodeType.Assignment) {
            const assignment = item.value as Assignment;
            this.currentAssignmentList.push(assignment);
          }
        });
      }
      return null;
    });
  }

  @action
  public async getCurrentNode(teachingPathId: number, nodeId: number) {
    this.currentNode = await this.teachingPathService.getCurrentNode(teachingPathId, nodeId);
  }

  @action
  public calculateCurrentNode = async (idTeachingPath: number, idNode: number) => {
    this.setFetchingDataStatus(true);
    this.resetCurrentArticleList();
    this.resetCurrentAssignmentList();
    this.resetCurrentDomainList();
    await this.getCurrentNode(idTeachingPath, idNode);
    const type = this.childrenType;

    switch (type) {
      case TeachingPathNodeType.Article:
        this.setCurrentDisplayedElement(TeachingPathNodeType.Article);
        break;
      case TeachingPathNodeType.Assignment:
        this.setCurrentDisplayedElement(TeachingPathNodeType.Assignment);
        break;
      case TeachingPathNodeType.Domain:
        this.setCurrentDisplayedElement(TeachingPathNodeType.Domain);
        break;
      default:
        this.setCurrentDisplayedElement(SubmitNodeType.Submit);
    }
    this.setFetchingDataStatus(false);
  }

  @action
  public calculateCurrentNodePreview = (type: TeachingPathNodeType | undefined) => {

    switch (type) {
      case TeachingPathNodeType.Article:
        this.setCurrentDisplayedElement(TeachingPathNodeType.Article);
        break;
      case TeachingPathNodeType.Assignment:
        this.setCurrentDisplayedElement(TeachingPathNodeType.Assignment);
        break;
      case TeachingPathNodeType.Domain:
        this.setCurrentDisplayedElement(TeachingPathNodeType.Domain);
        break;
      default:
        this.setCurrentDisplayedElement(SubmitNodeType.Submit);
    }
  }

  @action
  public onClickArticleOrAssignmentItem = async (idNode: number) => {
    await this.calculateCurrentNode(this.teachingPathId!, idNode);

    if (!isNull(this.currentNode!.children)) {
      this.currentNode!.children.forEach((child) => {
        if (!isNull(child.items)) {
          child.items.forEach((item) => {
            switch (item.type) {
              case TeachingPathNodeType.Article: {
                const article = item.value as Article;
                if (article.isSelected) {
                  this.pickUpItem(article.wpId!);
                }
                this.handleAssignment(false);
                this.handleIframe(true);
                break;
              }
              case TeachingPathNodeType.Assignment: {
                const article = item.value as Assignment;
                if (article.isSelected) {
                  this.pickUpItem(article.id!);
                }
                this.handleIframe(false);
                this.handleAssignment(true);
                break;
              }
              default: return null;
            }
          });
        }
      });
    }
  }

  @action
  public async getCurrentArticlesList(ids: Array<number>) {
    if (ids.length > 0) {
      const articles = await this.articleService.getArticlesByIds(ids);
      this.currentArticlesList = articles.map((article) => {
        if (this.currentNode && this.currentNode!.children.length > 0 && !isNull(this.currentNode!.children) && this.currentNode!.children !== null) {
          this.currentNode!.children.forEach(child => child.items && child.items.length > 0 && child.items.forEach((item) => {
            const articleItem = item.value as Article;
            if (articleItem.wpId === article.id) {
              article.isSelected = articleItem.isSelected;
              article.correspondingLevelArticleId = articleItem.correspondingLevelArticleId;
              article.wpId = article.id;
              article.id = articleItem.id;
            }
          }));
        }
        return article;
      }
      );
    }
  }

  @action
  public domainFullInfo() {
    this.currentNode!.children.forEach((child) => {
      if (child.items) {
        return child.items.forEach((item) => {
          if (item.type === TeachingPathNodeType.Domain) {
            const domain = item.value as Domain;
            this.currentDomainList.push(domain);
          }
        });
      }
      return null;
    });
  }

  @action
  public getTeachingPathById = async (id: number) => {
    this.currentTeachingPath = await this.listTeachingPaths.getTeachingPathById(id);
  }
}
