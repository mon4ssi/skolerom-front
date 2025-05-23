import { action, computed, observable } from 'mobx';
import intl from 'react-intl-universal';

import { injector } from 'Injector';
import {
  TeachingPath,
  TeachingPathArgs,
  TeachingPathNode,
  TeachingPathItem,
  TeachingPathItemValue,
  TeachingPathRepo,
  TEACHING_PATH_REPO,
  TeachingPathNodeArgs,
  TeachingPathNodeType
} from 'teachingPath/TeachingPath';
import { buildTeachingPathRequestDTO, buildFeatureImageForTeachingPathRequestDTO, buildBackgroundImageForTeachingPathRequestDTO } from './factory';
import { SAVE_DELAY } from 'utils/constants';
import { parseQueryString } from 'utils/queryString';
import { Article, Grade, Subject, Attachment, ARTICLE_SERVICE_KEY } from 'assignment/Assignment';
import { ArticleService } from 'assignment/service';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { GreepElements } from 'assignment/factory';

export const DRAFT_TEACHING_PATH_REPO = 'DRAFT_TEACHING_PATH_REPO';

const TEMPORAL = 67933;

export interface DraftTeachingPathRepo {
  saveTeachingPath: (teachingPath: DraftTeachingPath, localeId?: number) => Promise<string>;
  saveTeachingPathLang: (teachingPath: DraftTeachingPath, localeId?: number, actuallocalid?: number, newlocalid?: number) => Promise<string>;
  publishTeachingPath: (teachingPath: DraftTeachingPath) => Promise<void>;
  createTeachingPath: () => Promise<DraftTeachingPath>;
  createTeachingPathLocale: (id: number, localeid?: number) => Promise<DraftTeachingPath>;
  getKeywordsFromArticles: (arrayArticlesIds: Array<number>, arrayAsignmentsIds: Array<number>) => Promise<Array<string>>;
  getDraftTeachingPathById: (id: number, localeid?: number) => Promise<DraftTeachingPath>;
  getDraftForeignTeachingPathById: (id: number, isPreview?: boolean, localeid?: number) => Promise<{ teachingPath: DraftTeachingPath, articles?: Array<Article> }>;
  deleteTeachingPath: (id: number) => Promise<void>;
}

interface DraftTeachingPathArgs extends TeachingPathArgs {
  sessionId: string;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  parentNode?: EditableTeachingPathNode;
  selectedAssignmentsIds: Array<number>;
  selectedArticlesIds: Array<number>;
}

export class DraftTeachingPath extends TeachingPath {

  protected repo: DraftTeachingPathRepo = injector.get(DRAFT_TEACHING_PATH_REPO);
  protected teachingPathRepo: TeachingPathRepo = injector.get<TeachingPathRepo>(TEACHING_PATH_REPO);
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  protected _uuid: string;
  @observable protected _createdAt: string;
  @observable protected _updatedAt: string;
  @observable protected _publishedAt: string;
  @observable protected _selectedAssignmentsIds: Array<number>;
  @observable protected _selectedArticlesIds: Array<number>;

  @computed
  public get uuid() {
    return this._uuid;
  }

  @computed
  public get selectedAssignmentsIds() {
    return this._selectedAssignmentsIds;
  }

  @computed
  public get selectedArticlesIds() {
    return this._selectedArticlesIds;
  }

  @computed
  public get updatedAt() {
    return this._updatedAt;
  }

  @computed
  public get publishedAt() {
    return this._publishedAt;
  }

  @computed
  public get content(): EditableTeachingPathNode {
    return this._content as EditableTeachingPathNode;
  }

  @computed
  public get isDefaultTitle() {
    try {
      this.validateTitleIsNotDefault();
      return false;
    } catch (e) {
      return true;
    }
  }

  public isSavingRunning: boolean = false;
  public localeid: number = 1;
  @observable public isDraftSaving: boolean = false;
  public isPublishing: boolean = false;
  public isRunningPublishing: boolean = false;

  constructor(args: DraftTeachingPathArgs) {
    super(args);
    this._uuid = args.sessionId;
    this._createdAt = args.createdAt || '';
    this._updatedAt = args.updatedAt || '';
    this._publishedAt = args.publishedAt || '';
    this._selectedAssignmentsIds = args.selectedAssignmentsIds || [];
    this._selectedArticlesIds = args.selectedArticlesIds || [];
  }

  private validate(target: string) {
    if (target === 'publish') {
      this.validateTitle();
    }
    this.validateGradesAndSubjects();
    this.validateCopy();
    this.content.validate();
    this.validateDescription();
  }

  private validateTitle() {
    this.validateTitleLength();
  }

  private validateTitleLength() {
    const hasEnoughWords = this.title.trim().length >= 1;

    if (!hasEnoughWords) {
      throw new TeachingPathValidationError(
        'edit_teaching_path.validation.title_words_count'
      );
    }
  }

  private validateTitleIsNotDefault() {
    const equalsDefaultTitle = this.title === intl.get('edit_teaching_path.title.new_teaching_path_draft');

    if (equalsDefaultTitle) {
      throw new TeachingPathValidationError(
        'edit_teaching_path.validation.title_words_count'
      );
    }
  }

  private validateDescription() {
    this.validateDescriptionLength();
  }

  private validateDescriptionLength() {
    if (!(this.description.trim().length >= 1)) {
      throw new TeachingPathValidationError(
        'edit_teaching_path.validation.description_words_count'
      );
    }
  }

  private validateContent() {
    this.validateChildren();
    this.content.validate();
  }

  private validateChildren() {
    if (!this.content.children.length) {
      throw new TeachingPathValidationError(
        'edit_teaching_path.validation.empty_content'
      );
    }
  }

  private validateGradesAndSubjects() {
    if (this.grades.length === 0 || this.subjects.length === 0) {
      throw new TeachingPathValidationError('new assignment.validation.required_grades_and_subjects');
    }
  }

  private validateCopy() {
    if (
      this.isCopy && (
        /Copy$/.test(this.title) ||
        /Kopi$/.test(this.title) ||
        /copy$/.test(this.title) ||
        /kopi$/.test(this.title))
    ) {
      throw new TeachingPathValidationError('new assignment.copy_title_not_allow');
    }
  }

  @action
  public isValid(target: string) {
    try {
      this.validate(target);
      return true;
    } catch {
      return false;
    }
  }

  public anySubjects(butSubjects: Array<Subject>, node: EditableTeachingPathNode) {
    let returnArray: Array<Subject> = butSubjects;
    node!.items!.forEach((e) => {
      if (typeof (e.value.subjects) !== 'undefined') {
        returnArray = returnArray!.concat(e.value.subjects!);
      }
    });
    if (node!.children!.length > 0) {
      node!.children!.forEach((element) => {
        returnArray = this.anySubjects(returnArray, element);
      });
    }
    returnArray = returnArray!.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    return returnArray;
  }

  @action
  public addSubjectBySave = async () => {
    let myFirstSubjects: Array<Subject> = [];
    const idItems: Array<number> = [];
    const firstItems = this.content;
    if (this.subjects.length === 0) {
      if (firstItems.children.length > 0) {
        const firstItemForList = firstItems.children;
        firstItemForList.forEach((element) => {
          myFirstSubjects = this.anySubjects(myFirstSubjects, element);
        });
        if (typeof (myFirstSubjects) !== 'undefined') {
          myFirstSubjects.forEach((e) => {
            idItems.push(e.id);
          });
          const getSubjecsItems = await this.teachingPathRepo.getSubjectWpIds(idItems);
          this.subjects.splice(0, this.subjects.length);
          getSubjecsItems!.forEach((e) => {
            this.subjects.push(e);
          });
        }
      }
    }
  }

  @action
  public async setFeaturedImage() {
    const teachingPath = buildTeachingPathRequestDTO(this);
    const image = buildFeatureImageForTeachingPathRequestDTO(teachingPath.content);
    const bgImage = buildBackgroundImageForTeachingPathRequestDTO(teachingPath.content);
    if (bgImage) {
      this._backgroundImage = bgImage;
      this._featuredImage = image;
    } else {
      const articlesid = await this.addArticlesIdsBySave();
      const mediaImgsWP: Array<Attachment> = await this.articleService.fetchCoverImages(articlesid) || [];
      this._backgroundImage = mediaImgsWP.length > 0 ? mediaImgsWP[0].url_large : '';
      this._featuredImage = mediaImgsWP.length > 0 ? mediaImgsWP[0].path : '';
    }
  }

  @action
  public improbeSubjects(subjects: Array<Subject>) {
    if (this.isCopy) {
      subjects!.forEach((e) => {
        if (!this.subjects.includes(e)) {
          this.subjects.push(e);
        }
      });
    }
  }

  public anyGoals(butGoals: Array<GreepElements>, node: EditableTeachingPathNode) {
    let returnArray: Array<GreepElements> = butGoals;
    node!.items!.forEach((e) => {
      if (typeof (e.value.grepGoals) !== 'undefined') {
        returnArray = returnArray!.concat(e.value.grepGoals!);
      }
    });
    if (node!.children!.length > 0) {
      node!.children!.forEach((element) => {
        returnArray = this.anyGoals(returnArray, element);
      });
    }
    returnArray = returnArray!.filter((v, i, a) => a.findIndex(t => (t === v)) === i);
    return returnArray;
  }

  @action
  public async addGoalsBySave() {
    let myFirstGoals: Array<GreepElements> = [];
    const firstItems = this.content;
    if (firstItems.children.length > 0) {
      const firstItemForList = firstItems.children;
      firstItemForList.forEach((element) => {
        myFirstGoals = this.anyGoals(myFirstGoals, element);
      });
      if (typeof (myFirstGoals) !== 'undefined') {
        this._grepGoals!.splice(0, this._grepGoals!.length);
        myFirstGoals!.forEach((e) => {
          this._grepGoals!.push(e);
        });
      }
    }
  }

  public anyGrades(butGrades: Array<Grade>, node: EditableTeachingPathNode) {
    /* console.log("any grades");
    console.log(node!) */
    let returnArray: Array<Grade> = butGrades;
    node!.items!.forEach((e) => {
      if (typeof (e.value.grades) !== 'undefined') {
        returnArray = returnArray!.concat(e.value.grades!);
      }
    });
    if (node!.children!.length > 0) {
      node!.children!.forEach((element) => {
        returnArray = this.anyGrades(returnArray, element);
      });
    }
    returnArray = returnArray!.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    return returnArray;
  }

  @action
  public addGradesBySave = async () => {
    let myFirstGrades: Array<Grade> = [];
    const idItems: Array<number> = [];
    const firstItems = this.content;
    if (this.grades.length === 0) {
      if (firstItems.children.length > 0) {
        const firstItemForList = firstItems.children;
        firstItemForList.forEach((element) => {
          myFirstGrades = this.anyGrades(myFirstGrades, element);
        });
        if (typeof (myFirstGrades) !== 'undefined') {
          myFirstGrades.forEach((e) => {
            idItems.push(e.id);
          });
          const getGradesItems = await this.teachingPathRepo.getGradeWpIds(idItems);
          this.grades.splice(0, this.grades.length);
          getGradesItems!.forEach((e) => {
            this.grades.push(e);
          });
        }
      }
    }
  }

  @action
  public getFeaturedImageFromCover() {
    return this._featuredImage;
  }

  @action
  public setFeaturedImageFromCover(path: string) {
    this._featuredImage = path;
    this.save();
  }

  @action
  public setBackgroundImageHDResFromCover(urlLarge: string) {
    this._backgroundImage = urlLarge;
    this.save();
  }

  @action
  public getBackgroundImageFromCover() {
    return this._backgroundImage;
  }

  @action
  public setValueLocaleid(localid: number) {
    this.localeid = localid;
  }

  public anyArticlesIds(butIds: Array<number>, node: EditableTeachingPathNode) {
    const items: TeachingPathItem = node!.getItems(node!)![0];
    let returnArray: Array<number> = butIds;
    node!.items!.forEach((e) => {
      if (items.type === TeachingPathNodeType.Article) {
        returnArray = returnArray!.concat(e.value.id!);
      }
    });
    if (node!.children!.length > 0) {
      node!.children!.forEach((element) => {
        returnArray = this.anyArticlesIds(returnArray, element);
      });
    }
    returnArray = returnArray!.filter((v, i, a) => a.findIndex(t => (t === v)) === i);
    return returnArray;
  }

  public anyAssignmentIds(butIds: Array<number>, node: EditableTeachingPathNode) {
    const items: TeachingPathItem = node!.getItems(node!)![0];
    let returnArrayAssignments: Array<number> = butIds;
    node!.items!.forEach((e) => {
      if (items.type === TeachingPathNodeType.Assignment) {
        returnArrayAssignments = returnArrayAssignments!.concat(e.value.id!);
      }
    });
    if (node!.children!.length > 0) {
      node!.children!.forEach((element) => {
        returnArrayAssignments = this.anyAssignmentIds(returnArrayAssignments, element);
      });
    }
    returnArrayAssignments = returnArrayAssignments!.filter((v, i, a) => a.findIndex(t => (t === v)) === i);
    return returnArrayAssignments;
  }

  @action
  public addArticlesIdsBySave = async () => {
    /* console.log("add ids"); */
    let myFirstIds: Array<number> = [];
    const myFirstAssignmentsIds: Array<number> = [];
    const idItems: Array<number> = [];
    const idAssignmentItems: Array<number> = [];
    const firstItems = this.content;
    if (firstItems.children.length > 0) {
      const firstItemForList = firstItems.children;
      firstItemForList.forEach((element) => {
        myFirstIds = this.anyArticlesIds(myFirstIds, element);
      });
      if (typeof (myFirstIds) !== 'undefined') {
        myFirstIds.forEach((e) => {
          idItems.push(e);
        });
      }
    }
    return idItems;
  }

  @action
  public addAssignmentsIdsBySave = async () => {
    /* console.log("add ids"); */
    let myFirstAssignmentsIds: Array<number> = [];
    const idAssignmentItems: Array<number> = [];
    const firstItems = this.content;
    if (firstItems.children.length > 0) {
      const firstItemForList = firstItems.children;
      firstItemForList.forEach((element) => {
        myFirstAssignmentsIds = this.anyAssignmentIds(myFirstAssignmentsIds, element);
      });
      if (typeof (myFirstAssignmentsIds) !== 'undefined') {
        myFirstAssignmentsIds.forEach((e) => {
          idAssignmentItems.push(e);
        });
      }
      /* this._selectedAssignmentsIds = idAssignmentItems; */

    }
    return idAssignmentItems;
  }

  @action
  public async save() {
    if (!this.isSavingRunning) {
      this.isSavingRunning = true;
      setTimeout(
        async () => {
          this.isDraftSaving = true;
          try {
            if (this.isPublishing) {
              return;
            }
            if (!this.isRunningPublishing) {
              this.addGradesBySave();
              this.addSubjectBySave();
            }
            this.addGoalsBySave();
            this.setUpdatedAt(await this.repo.saveTeachingPath(this, this.localeid));
          } catch (error : any) {
            if (error instanceof AlreadyEditingTeachingPathError) {
              Notification.create({
                type: NotificationTypes.ERROR,
                title: intl.get('edit_teaching_path.validation.already_editing')
              });
            } else {
              console.error('Error while saving draft:', error.message);
            }
          } finally {
            this.isDraftSaving = false;
            this.isSavingRunning = false;
          }
        },
        SAVE_DELAY
      );
    }
  }

  @action
  public async saveLangs(idlocaleid: number, newlocaleid: number) {
    if (!this.isSavingRunning) {
      this.isSavingRunning = true;
      setTimeout(
        async () => {
          this.isDraftSaving = true;
          try {
            if (this.isPublishing) {
              return;
            }
            this.setUpdatedAt(await this.repo.saveTeachingPathLang(this, this.localeid, idlocaleid, newlocaleid));
          } catch (error : any) {
            if (error instanceof AlreadyEditingTeachingPathError) {
              Notification.create({
                type: NotificationTypes.ERROR,
                title: intl.get('edit_teaching_path.validation.already_editing')
              });
            } else {
              console.error('Error while saving draft:', error.message);
            }
          } finally {
            this.isDraftSaving = false;
            this.isSavingRunning = false;
          }
        },
        SAVE_DELAY
      );
    }
  }

  @action
  public async saveTeachingPath() {
    this.validateContent();

    try {
      /* tslint:disable:no-string-literal */
      const search = parseQueryString(window.location.search)['locale_id'];
      /* tslint:enable:no-string-literal */
      if (search) {
        await this.repo.saveTeachingPath(this, Number(search));
      } else {
        await this.repo.saveTeachingPath(this);
      }
    } catch (error : any) {
      if (error instanceof AlreadyEditingTeachingPathError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('edit_teaching_path.validation.already_editing')
        });
      } else {
        console.error('Error while saving draft:', error.message);
      }
    }
  }

  @action
  public setTitle = (title: string) => {
    this._title = title;
    this.save();
  }

  @action
  public setDescription = (description: string) => {
    this._description = description;
    this.save();
  }

  @action
  public async getAllSelectedArticlesIds() {
    /* console.log(this._numberOfArticles); */
    const articlesIds = await this.addArticlesIdsBySave();
    return articlesIds;
  }

  @action
  public async getAllSelectedAssignmentsIds() {
    /* console.log(this._numberOfArticles); */
    const assignmentIds = await this.addAssignmentsIdsBySave();
    return assignmentIds;
  }

  @action
  public setGuidance = (value: string) => {
    this._guidance = value;
    this.save();
  }

  public setValidateHasGuidance = (value: string) => {
    const guidanceBlank1 = '<p><br></p>';
    const guidanceBlank2 = '';

    if (value !== guidanceBlank1 && value !== guidanceBlank2) {
      this._hasGuidance = true;
    } else {
      this._hasGuidance = false;

      if (this.guidance !== guidanceBlank1 && this.guidance !== guidanceBlank2) {
        this._hasGuidance = true;
      } else {
        if (this.content.guidance !== guidanceBlank1 && this.content.guidance !== guidanceBlank2) {
          this._hasGuidance = true;
        } else {
          let children: Array<EditableTeachingPathNode> = [];
          let childrenTmp: Array<EditableTeachingPathNode> = this.content.children;
          let continueLoop = true;
          let nroNodes: number = 0;

          //
          while (continueLoop) {
            nroNodes = 0;
            children = childrenTmp;
            childrenTmp = [];

            children.some((item) => {
              if (item.guidance !== guidanceBlank1 && item.guidance !== guidanceBlank2) {
                this._hasGuidance = true;
                return true;
              }

              if (item.children.length > 0) {
                item.children.forEach((child) => {
                  if (child.guidance !== guidanceBlank1 && child.guidance !== guidanceBlank2) {
                    this._hasGuidance = true;
                    return true;
                  }

                  if (child.children.length > 0) {
                    childrenTmp.push(child);
                  }
                });

                nroNodes += 1;
              }
            });

            continueLoop = (nroNodes > 0);
          }
        }
      }
    }
  }

  @action
  public setGrepSourcesIds = (data: Array<number>) => {
    this._sources = data;
    this.save();
  }

  @action
  public setGrepKeywordsIds = (data: Array<string>) => {
    this._keywords = data;
    this.save();
  }

  @action
  public setGrepCoreElementsIds = (data: Array<number>) => {
    this._grepCoreElementsIds = data;
    this.save();
  }

  @action
  public setOpen = (data: boolean) => {
    this._open = data;
    this.save();
  }

  @action
  public setGrepMainTopicsIds = (data: Array<number>) => {
    this._grepMainTopicsIds = data;
    this.save();
  }

  @action
  public setGrepGoalsIds = (data: Array<number>) => {
    this._grepGoalsIds = data;
    this.isRunningPublishing = true;
    this.save();
  }

  @action
  public setGrepGoals = (data: Array<GreepElements>) => {
    this._grepGoals = data;
    this.isRunningPublishing = true;
    this.save();
  }

  @action
  public setGrepReadingInSubjectId = (data: Array<number>) => {
    this._grepReadingInSubjectsIds = data;
    this.isRunningPublishing = true;
    this.save();
  }

  @action
  public setIsPrivate = (isPrivate: boolean) => {
    this._isPrivate = isPrivate;
    this.save();
  }

  @action
  public setMySchool = (schools: string) => {
    this._mySchools = schools;
    this.save();
  }

  @action
  public getMySchool = () => this._schools

  @action
  public setIsMySchool(isSchool: boolean) {
    this._isMySchool = isSchool;
    this.save();
  }

  public setIsInReview(inReview: boolean) {
    this._inReview = inReview;
    this.save();
  }

  @action
  public setUpdatedAt(updatedAt: string) {
    this._updatedAt = updatedAt;
  }

  @action
  public setContent = (content: EditableTeachingPathNode) => {
    this._content = content;
  }

  @action
  public addGrade(grade: Grade) {
    this.grades.push(grade);
    this.isRunningPublishing = true;
    this.save();
  }

  @action
  public addSubject(subject: Subject) {
    this.subjects.push(subject);
    this.isRunningPublishing = true;
    this.save();
  }

  public removeGrade(removableGrade: Grade) {
    this._grades = this.grades.filter(grade => Number(grade.id) !== Number(removableGrade.id));
    this.save();
  }

  public removeSubject(removableSubject: Subject) {
    this._subjects = this.subjects.filter(
      subject => subject.id !== removableSubject.id
    );
    this.save();
  }

  @action
  public setLevels(level: number) {
    this._levels = this.levels.includes(level) ?
      this.levels.filter(studentLevel => studentLevel !== level).sort() :
      [...this.levels, level].sort();

    this.save();
  }

  public async saveImmediate() {
    await this.repo.saveTeachingPath(this, this.localeid);
  }

  public getOpen() {
    return this._open;
  }

  @action
  public async publish() {
    this.validate('publish');
    this.isPublishing = true;
    this.saveImmediate();
    return this.repo.publishTeachingPath(this);
  }

  public getIsDraftSaving(): boolean {
    return this.isDraftSaving;
  }

  @action
  public handleOpenTeacherGuidance = (nroLevel: string): void => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTG') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.add('open');
    modalTGBack[0].classList.remove('hide');

    const editDescript = (document.getElementsByClassName(`jr-desEdit${nroLevel}`)[0] as HTMLDivElement);
    const editInputText = (editDescript.getElementsByClassName('ql-editor')[0] as HTMLInputElement);
    editInputText.focus();
  }

  @action
  public setLocaleId(localeId: number | null) {
    const oldLocaleid = this._localeId;
    this._localeId = localeId;
    // this.saveLangs(oldLocaleid!, localeId!);
    this.save();
  }
}

interface EditableTeachingPathNodeArgs extends TeachingPathNodeArgs {
  draftTeachingPath: DraftTeachingPath;
  parentNode?: EditableTeachingPathNode;
}

export class EditableTeachingPathNode extends TeachingPathNode {

  @observable protected _draftTeachingPath: DraftTeachingPath;
  @observable protected _parentNode?: EditableTeachingPathNode;

  constructor(args: EditableTeachingPathNodeArgs) {
    super(args);
    this._draftTeachingPath = args.draftTeachingPath;
    this._children = args.children ? args.children.map(
      child => new EditableTeachingPathNode({ ...child, draftTeachingPath: args.draftTeachingPath })
    ) : [];
    this._parentNode = args.parentNode;
  }

  private validateTitle() {
    if (!this.selectQuestion && this.children.length) {
      throw new TeachingPathValidationError(
        'edit_teaching_path.validation.title_node_words_count'
      );
    }
  }

  public validate() {
    this.validateTitle();

    this.children.forEach(child => child.validate());
  }

  @computed
  public get draftTeachingPath() {
    return this._draftTeachingPath;
  }

  @computed
  public get children(): Array<EditableTeachingPathNode> {
    return this._children as Array<EditableTeachingPathNode>;
  }

  @computed
  public get parentNode() {
    return this._parentNode;
  }

  @action
  public getItems = (node: EditableTeachingPathNode) => node!._items

  @action
  public setChildren = (children: Array<EditableTeachingPathNode>) => {
    this._children = children;
    this.draftTeachingPath.save();
  }

  @action
  public addChild = (child: EditableTeachingPathNode, index: number = -1) => {
    const childrenCopy = this.children.slice();
    childrenCopy.splice(index, 0, child);
    this._children = childrenCopy;
    this.draftTeachingPath.save();
  }

  @action
  public appEndChild = (child: EditableTeachingPathNode, index: number = -1) => {
    const childrenCopy = this.children.slice();
    childrenCopy.push(child);
    this._children = childrenCopy;
    this.draftTeachingPath.save();
  }

  @action
  public addChildByOrder = (child: EditableTeachingPathNode, search: EditableTeachingPathNode, order: string) => {
    /* console.log("HAAAAAAAAAAAAAAAAAAaa");
    console.log(child)
    console.log(this.children) */
    const childrenCopy = this.children.slice();
    /* console.log(childrenCopy) */
    const index = childrenCopy.indexOf(search);
    /* console.log(index) */
    const valueInside = (index > -1) ? (order === 'left') ? (index === 0) ? 0 : index : index + 1 : 0;
    if (index > -1) {
      /* console.log(valueInside) */
      childrenCopy.splice(valueInside, 0, child!);
    }
    this._children = childrenCopy;
    this.draftTeachingPath.save();
  }

  @action
  public removeChild = (node: EditableTeachingPathNode) => {
    this._children = this.children.filter(child => node !== child);
    this.draftTeachingPath.save();
  }

  @action
  public removeChildUnique = (node: EditableTeachingPathNode) => {
    if (node.children && node.children.length > 0) {
      const myChild = node.children;
      this._children = this.children.filter(child => node !== child);
      this._children = this._children.concat(myChild);
    } else {
      this._children = this.children.filter(child => node !== child);
    }
    this.draftTeachingPath.save();
  }

  @action
  public setSelectedQuestion = (title: string) => {
    this._selectQuestion = title;
    this.draftTeachingPath.save();
  }

  @action
  public setGuidance = (value: string) => {
    this._guidance = value;
    this.draftTeachingPath.save();
  }

  @action
  public improbeSubjects = (subjects: Array<Subject>) => {
    this.draftTeachingPath.improbeSubjects(subjects);
  }

  @action
  public addItem = (item: TeachingPathItemValue) => {
    this._items!.push(new TeachingPathItem({ type: this.type, value: item }));
    this.draftTeachingPath.save();
  }

  @action
  public editItem = (idChanged: number, item: TeachingPathItemValue) => {
    const newItem = new TeachingPathItem({ type: this.type, value: item });
    let itemIndex = 0;
    this._items!.forEach((e, index) => {
      if (Number(e.value.id) === Number(idChanged)) {
        itemIndex = index;
      }
    });
    this._items![itemIndex] = newItem;
    this.draftTeachingPath.save();
  }

  @action
  public editItemDomain = (item: TeachingPathItemValue) => {
    const newItem = new TeachingPathItem({ type: this.type, value: item });
    this._items![0] = newItem;
    this.draftTeachingPath.save();
  }

  @action
  public removeItem = (id: number) => {
    this._items = this._items!.filter(
      item => item.value.id !== id
    );
    this.draftTeachingPath.save();
  }
}

export class TeachingPathValidationError extends Error {
  public readonly localizationKey: string;

  constructor(localizationKey: string) {
    super(localizationKey);
    this.localizationKey = localizationKey;
  }
}

export class AlreadyEditingTeachingPathError extends Error { }

export interface ShortestPathArgs {
  id: number;
  selectQuestion: string;
  type: string;
  shortestPath: ShortestPathArgs | undefined;
}

export class ShortestPath {
  public _id: number;
  public _selectQuestion: string;
  public _type: string;
  public _shortestPath: ShortestPathArgs | undefined;
  constructor(args: ShortestPathArgs) {
    this._id = args.id;
    this._selectQuestion = args.selectQuestion;
    this._type = args.type;
    this._shortestPath = args.shortestPath;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get selectQuestion() {
    return this._selectQuestion;
  }

  @computed
  public get type() {
    return this._type;
  }

  @computed
  public get shortestPath() {
    return this._shortestPath;
  }
}

export interface BreadcrumbsArgs {
  id: number;
  parentNodeId: number | null;
  selectQuestion: string;
  items: Array<TeachingPathItem> | undefined;
  shortest?: number | null | undefined;
  shortpathid?: Array<number>;
}

export class Breadcrumbs {
  public _id: number;
  public _selectQuestion: string;
  public _parentNodeId: number | null;
  public _items: Array<TeachingPathItem> | undefined;
  public _shortest?: number | null | undefined;
  public _shortpathid?: Array<number>;

  constructor(args: BreadcrumbsArgs) {
    this._id = args.id;
    this._items = args.items ? args.items : undefined;
    this._selectQuestion = args.selectQuestion;
    this._parentNodeId = args.parentNodeId;
    this._shortest = args.shortest;
    this._shortpathid = args.shortpathid;
  }

  @computed
  public get id() {
    return this._id;
  }

  @computed
  public get items() {
    return this._items;
  }

  @computed
  public get parentNodeId() {
    return this._parentNodeId;
  }

  @computed
  public get selectQuestion() {
    return this._selectQuestion;
  }

  @computed
  public get shortest() {
    return this._shortest;
  }

  @computed
  public get shortpathid() {
    return this._shortpathid;
  }
}
