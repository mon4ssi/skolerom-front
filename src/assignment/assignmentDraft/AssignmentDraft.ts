import { action, computed, observable } from 'mobx';
import intl from 'react-intl-universal';
import uniqBy from 'lodash/uniqBy';
import cloneDeep from 'lodash/cloneDeep';

import { injector } from 'Injector';
import {
  Assignment,
  AssignmentArgs,
  Grade, ImageChoiceQuestion, ImageChoiceQuestionOption,
  MultipleChoiceQuestion,
  MultipleChoiceQuestionOption,
  QuestionAttachment,
  QuestionParams,
  QuestionType,
  Subject,
  TextQuestion,
} from '../Assignment';
import {
  TeachingPath,
  TeachingPathArgs,
  TeachingPathNode,
  TeachingPathItem,
  TeachingPathItemValue,
  TeachingPathRepo,
  TEACHING_PATH_REPO,
  TeachingPathNodeArgs
} from 'teachingPath/TeachingPath';
import { Article, GreepElements } from 'assignment/Assignment';
import { AssertionError } from 'assert';
import { SAVE_DELAY } from 'utils/constants';
import { EditableContentBlock, EditableImagesContentBlock, EditableTextContentBlock, EditableVideosContentBlock } from './EditableContentBlock';
import { ContentBlock, ContentBlockType } from '../ContentBlock';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { ConsoleView } from 'react-device-detect';

const MIN_QUESTION_NUMBER = 1;

const MIN_OPTIONS_COUNT = 2;

export interface DraftAssignmentRepo {
  saveAttachment(assignmentId: number, attachmentId: number): Promise<void>;
  removeAttachment(assignmentId: number, attachmentId: number): Promise<number>;
  getNewAssignment(): Promise<DraftAssignment>;
  getKeywordsFromArticles(arrayWpIds: Array<number>): Promise<Array<string>>;
  getDraftAssignmentById(id: number): Promise<DraftAssignment>;
  saveDraftAssignment(draft: DraftAssignment): Promise<string>;
  publishAssignment(draft: DraftAssignment): Promise<void>;
}

export const DRAFT_ASSIGNMENT_REPO = 'DRAFT_ASSIGNMENT_REPO';

export type EditableQuestion = EditableTextQuestion | EditableMultipleChoiceQuestion | EditableImageChoiceQuestion;

export interface DraftAssignmentArgs {
  assignment: AssignmentArgs;
  sessionId: string;
  questions?: Array<EditableQuestion>;
  questionsWithError: number | null;
}

export class DraftAssignment extends Assignment {

  protected teachingPathRepo: TeachingPathRepo = injector.get<TeachingPathRepo>(TEACHING_PATH_REPO);
  protected repo: DraftAssignmentRepo = injector.get<DraftAssignmentRepo>(
    DRAFT_ASSIGNMENT_REPO
  );

  public sessionId: string;
  public isSavingRunning: boolean = false;
  @observable public isDraftSaving: boolean = false;
  public isPublishing: boolean = false;
  @observable public questionsWithError: number | null;

  constructor(args: DraftAssignmentArgs) {
    super(args.assignment);
    this.sessionId = args.sessionId;
    this.questionsWithError = args.questionsWithError;
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
  @computed
  public get isCopy() {
    return this._isCopy;
  }

  @computed
  public get questionsWithErrors() {
    return this.questionsWithError;
  }

  @computed
  public get questions(): Array<EditableQuestion> {
    return this._questions as Array<EditableQuestion>;
  }

  public set grades(grades: Array<Grade>) {
    this._grades = grades;
  }

  public set keywords(keywords: Array<string>) {
    this._keywords = keywords;
  }

  private validate(target: string) {
    if (target === 'publish') {
      this.validateTitle();
    }
    this.validateNumberOfQuestions();
    this.validateGradesAndSubjects();
    this.validateCopy();
    this.validateDescription();

    this.questions.forEach(question => question.validate());
  }

  public set questions(questions: Array<EditableQuestion>) {
    this._questions = questions;
  }

  private validateTitle() {
    this.validateTitleLength();
    // TODO: Check if this should allow to publish?
    // this.validateTitleIsNotDefault();
  }

  private validateTitleLength() {
    const hasEnoughWords = this.title.trim().length >= 1;

    if (!hasEnoughWords) {
      throw new AssignmentValidationError(
        'new assignment.validation.title_words_count'
      );
    }
  }

  private validateTitleIsNotDefault() {
    const equalsDefaultTitle = this.title === intl.get('new assignment.new_assignment_draft');

    if (equalsDefaultTitle) {
      throw new AssignmentValidationError(
        'new assignment.validation.title_words_count'
      );
    }
  }

  private validateDescription() {
    this.validateDescriptionLength();
  }

  private validateDescriptionLength() {
    if (!(this.description.trim().length >= 1)) {
      throw new AssignmentValidationError(
        'new assignment.validation.description_words_count'
      );
    }
  }

  private validateNumberOfQuestions() {
    if (this.questions.length < MIN_QUESTION_NUMBER) {
      throw new AssignmentValidationError(
        'new assignment.validation.number_of_questions'
      );
    }
  }

  private validateGradesAndSubjects() {
    if (this.grades.length === 0 || this.subjects.length === 0) {
      throw new AssignmentValidationError('new assignment.validation.required_grades_and_subjects');
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
      throw new AssignmentValidationError('new assignment.copy_title_not_allow');
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

  @action
  public setQuestionsWithError(value: number | null) {
    this.questionsWithError = value;
  }

  @action
  public setTitle(title: string): void {
    this._title = title;
    this.save();
  }

  @action
  public setDescription(description: string) {
    this._description = description;
    this.save();
  }

  @action
  public setGuidance(value: string) {
    this._guidance = value;
    this.save();
  }

  @action
  public setGrepCoreElementsIds = (data: Array<number>) => {
    this.grepCoreElementsIds = data;
    this.save();
  }

  @action
  public setOpen = (data: boolean) => {
    this._open = data;
    this.save();
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
  public setGrepMainTopicsIds = (data: Array<number>) => {
    this.grepMainTopicsIds = data;
    this.save();
  }

  @action
  public setGrepGoalsIds = (data: Array<number>) => {
    this.grepGoalsIds = data;
    this.save();
  }
  @action
  public setGrepGoals = (data: Array<GreepElements>) => {
    this.grepGoals = data;
    this.save();
  }

  @action
  public setGrepReadingInSubjectId = (data: Array<number>) => {
    this.grepReadingInSubjectsIds = data;
    this.save();
  }

  public getListOfgrepCoreElementsIds() {
    return this.grepCoreElementsIds;
  }

  public getListOfgrepGoalsIds() {
    return this.grepGoalsIds;
  }

  public setListgrepGoalsIds(data: Array<number>): void {
    this.grepGoalsIds = data;
  }

  public getListOfgrepMainTopicsIds() {
    return this.grepMainTopicsIds;
  }

  public getListOfgrepReadingInSubjectId() {
    return this.grepReadingInSubjectsIds;
  }

  public getOpen() {
    return this._open;
  }

  @action
  public setFeaturedImage() {
    this._featuredImage = this.relatedArticles[0] && this.relatedArticles[0].images && this.relatedArticles[0].images.url;
  }

  @action
  public setFeaturedImageFromCover(path: string) {
    this._featuredImage = path;
    this.save();
  }

  @action
  public getFeaturedImageFromCover() {
    return this._featuredImage;
  }

  @action
  public getAllSelectedArticlesIds() {
    /* console.log(this.relatedArticles); */
    return this.relatedArticles.map(item => item.id);
  }

  @action
  public setLevels(level: number) {
    this._levels = this._levels.includes(level) ?
      this._levels.filter(studentLevel => studentLevel !== level).sort() :
      [...this._levels, level].sort();

    this.save();
  }

  @action
  public addQuestion(question: EditableQuestion) {
    this.questions = [...this.questions, question];
    this.save();
  }

  @action
  public addNewQuestion(type: QuestionType): void {
    switch (type) {
      case QuestionType.Text: {
        this.questions.push(
          EditableTextQuestion.fromIndexAndAssignment(this._questions.length, this)
        );
        this.save();
        break;
      }

      case QuestionType.MultipleChoice: {
        this.questions.push(
          EditableMultipleChoiceQuestion.fromIndexAndAssignment(
            this.questions.length,
            this
          )
        );
        this.save();
        break;
      }

      case QuestionType.ImageChoice: {
        this.questions.push(
          EditableImageChoiceQuestion.fromIndexAndAssignment(
            this.questions.length,
            this
          )
        );
        this.save();
        break;
      }

      default:
        throw new TypeError(`Unimplemented question type: ${type}`);
    }
  }

  public setIsPrivate(isPrivate: boolean) {
    this._isPrivate = isPrivate;
    this.save();
  }

  public setMySchool = (schools: string) => {
    this._mySchools = schools;
    this.save();
  }

  public getMySchool = () => this._schools;

  public setIsMySchool(isSchool: boolean) {
    this._isMySchool = isSchool;
    this.save();
  }

  public setUpdatedAt(updatedAt: string) {
    this._updatedAt = updatedAt;
  }

  public handlePrivate(bool: boolean) {
    this.setIsPrivate(bool);
    this.save();
  }

  @action
  public async getKeywordsFromArticles(wpIds: Array<number>) {
    // this.validateTitle();
    const allWpIdsFromArticles = this.getAllSelectedArticlesIds();

    try {
      await this.repo.getKeywordsFromArticles(allWpIdsFromArticles);
    } catch (error) {
      if (error instanceof AlreadyEditingAssignmentError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('new assignment.already_editing')
        });
      } else {
        /* console.error('Error while getting keywords:', error.message); */
      }
    }
  }

  @action
  public async saveAssignment() {
    // this.validateTitle();
    this.validateNumberOfQuestions();
    this.questions.forEach(question => question.validate());

    try {
      await this.repo.saveDraftAssignment(this);
    } catch (error) {
      if (error instanceof AlreadyEditingAssignmentError) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('new assignment.already_editing')
        });
      } else {
        console.error('Error while saving draft:', error.message);
      }
    }
  }

  @action
  public async save() {
    if (!this.isSavingRunning) {
      this.isSavingRunning = true;
      setTimeout(
        async () => {
          this.isDraftSaving = true;
          try {
            if (this.isPublishing) return;
            this.setUpdatedAt(await this.repo.saveDraftAssignment(this));
          } catch (error) {
            if (error instanceof AlreadyEditingAssignmentError) {
              Notification.create({
                type: NotificationTypes.ERROR,
                title: intl.get('new assignment.already_editing')
              });
            } else {
              console.error('Error while saving draft:', error.message);
            }
          } finally {
            this.isDraftSaving = false;
            this.isSavingRunning = false;
            this.isPublishing = false;
          }
        },
        SAVE_DELAY,
      );
    }
  }

  public async saveImmediate() {
    await this.repo.saveDraftAssignment(this);
  }

  @action
  public async publish() {
    this.validate('publish');
    this.isPublishing = true;
    this.saveImmediate();
    this.isPublishing = false;
    return this.repo.publishAssignment(this);
  }

  public getIsDraftSaving(): boolean {
    return this.isDraftSaving;
  }

  @action
  public addArticle(article: Article) {
    this.setArticle(article);
    this.save();
  }

  @action
  public setArticle = async (article: Article) => {
    /* console.log(`Setting ${article!.id}`); */
    const idItems: Array<number> = [];
    const idItemsSubejs: Array<number> = [];
    this._relatedArticles = this.relatedArticles.concat(article);

    const allGrades: Array<Grade> = [...this.grades, ...article.grades!];
    const allSubjects: Array<Subject> = [...this.subjects, ...article.subjects!];

    allGrades.forEach((e) => {
      idItems.push(e.id);
    });

    allSubjects.forEach((e) => {
      idItemsSubejs.push(e.id);
    });
    const getGradesItems = await this.teachingPathRepo.getGradeWpIds(idItems);
    const getSubjecsItems = await this.teachingPathRepo.getSubjectWpIds(idItemsSubejs);
    this._grades.splice(0, this._grades.length);
    getGradesItems!.forEach((e) => {
      this._grades.push(e);
    });
    this._subjects.splice(0, this._subjects.length);
    getSubjecsItems!.forEach((e) => {
      this._subjects.push(e);
    });

    // this._grades = uniqBy(allGrades, 'id');
    // this._subjects = uniqBy(allSubjects, 'id');
  }

  @action
  public addGrade(grade: Grade) {
    this.grades.push(grade);
    this.save();
  }

  @action
  public addSubject(subject: Subject) {
    this.subjects.push(subject);
    this.save();
  }

  @action
  public setGrades(grades: Array<Grade>) {
    this._grades = grades;
    this.save();
  }

  @action
  public setSubjects(subjects: Array<Subject>) {
    this._subjects = subjects;
    this.save();
  }

  @action
  public removeArticle(removableArticle: Article) {
    this._relatedArticles = this.relatedArticles.filter(
      article => article.id !== removableArticle.id
    );

    const newGrades: Array<Grade> = [];
    const newSubjects: Array<Subject> = [];

    this.relatedArticles.forEach((article) => {
      (article.grades || []).forEach(grade => newGrades.push(grade));
      (article.subjects || []).forEach(subject => newSubjects.push(subject));
    });

    this.setGrades(uniqBy(newGrades, 'id'));
    this.setSubjects(uniqBy(newSubjects, 'id'));

    this.save();
  }

  public removeGrade(removableGrade: Grade) {
    this._grades = this.grades.filter(grade => grade.id !== removableGrade.id);
    this.save();
  }

  public removeSubject(removableSubject: Subject) {
    this._subjects = this.subjects.filter(
      subject => subject.id !== removableSubject.id
    );
    this.save();
  }

  public duplicateWithOrder(order: number): EditableQuestion {
    throw new AssertionError({ message: 'Not implimented' });
  }

  @action
  public reorderQuestions(oldIndex: number, newIndex: number) {
    const currentQuestion = this.questions[oldIndex];
    const questions = this.questions.slice();
    questions.splice(oldIndex, 1);
    questions.splice(newIndex, 0, currentQuestion);
    questions.forEach((question, index) => question.setOrder(index));

    this.questions = questions;

    this.save();
  }

  public deleteQuestion(index: number) {
    this.questions = this.questions.filter(question => question.orderPosition !== index);
    this.questions.forEach(
      (question, index) => question.orderPosition !== index ? question.setOrder(index) : null
    );
    this.save();
  }

  @action
  public setLocaleId(localeId: number | null) {
    this._localeId = localeId;
    this.save();
  }
}

export interface EditableQuestionArgs extends QuestionParams {
  assignmentDraft: DraftAssignment;
}

export interface QuestionActions {
  assignmentDraft: DraftAssignment;
  isValid: boolean;
  questionsWithError?: number;
  validate: () => void;
  save: () => void;
  setTitle: (title: string) => void;
  setOrder: (order: number) => void;
  duplicateWithOrder?: (order: number) => void;
}

export interface EditableTextQuestionArgs extends QuestionParams {
  assignmentDraft: DraftAssignment;
}

export class EditableTextQuestion extends TextQuestion implements QuestionActions {

  public isValid: boolean = false;
  public assignmentDraft: DraftAssignment;
  public _content: Array<ContentBlock>;

  constructor(args: EditableTextQuestionArgs) {
    super({ ...args });
    this.assignmentDraft = args.assignmentDraft;
    this._content = args.contentBlocks;
  }

  public static fromIndexAndAssignment(index: number, assignment: DraftAssignment) {
    return new EditableTextQuestion({
      assignmentDraft: assignment,
      title: '',
      guidance: '',
      order: index,
      contentBlocks: []
    });
  }

  private validateTitle() {
    if (!this.title || this.title.length <= 0) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_title'
      );
    }
  }

  private validateContentBlocks() {
    return this.content.forEach((block: ContentBlock) => {
      switch (block.type) {
        case ContentBlockType.Text: {
          const currentBlock = block as EditableTextContentBlock;
          let cleanText = currentBlock.text.replace(/<\/?[^>]+(>|$)/g, '');
          cleanText = cleanText.replace(/<\/?[^>]+(>|$)/g, '');
          if (!currentBlock.text.trim() || cleanText.trim() === '') {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        case ContentBlockType.Images: {
          const currentBlock = block as EditableImagesContentBlock;
          if (currentBlock.images.length === 0) {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        case ContentBlockType.Videos: {
          const currentBlock = block as EditableVideosContentBlock;
          if (currentBlock.videos.length === 0) {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        default:
          throw new TypeError(`Unknown content block type: ${block.type}`);
      }
    });
  }

  public checkPreviousContentBlock(question: EditableQuestion, type: ContentBlockType): boolean {
    const filteredContentBlocks = question.content.filter(i => i.type === type);
    if (filteredContentBlocks.length <= 0) {
      return true;
    }
    const previousBlock = filteredContentBlocks[filteredContentBlocks.length - 1] ;
    switch (type) {
      case ContentBlockType.Text: {
        const previousFilteredBlock = previousBlock as EditableTextContentBlock;
        if (previousFilteredBlock) {
          return !!previousFilteredBlock.text;
        }
        return true;
      }
      case ContentBlockType.Images: {
        const previousFilteredBlock = previousBlock as EditableImagesContentBlock;
        if (previousFilteredBlock) {
          return previousFilteredBlock.images.length > 0;
        }
        return true;
      }
      case ContentBlockType.Videos: {
        const previousFilteredBlock = previousBlock as EditableVideosContentBlock;
        if (previousFilteredBlock) {
          return previousFilteredBlock.videos.length > 0;
        }
        return true;
      }
      default: return false;
    }
  }

  public duplicateWithOrder(order: number): EditableQuestion {
    return new EditableTextQuestion({
      order,
      assignmentDraft: this.assignmentDraft!,
      title: this.title,
      guidance: this.guidance,
      contentBlocks: this._content.map(item => cloneDeep(item))
    });
  }

  public validate() {
    this.validateTitle();
    this.validateContentBlocks();
  }

  public save() {
    this.assignmentDraft!.save();
  }

  @computed
  public get title() {
    return this._title;
  }

  public set title(title: string) {
    this._title = title;
  }

  @computed
  public get guidance() {
    return this._guidance;
  }

  public set guidance(value: string) {
    this._guidance = value;
  }

  @action
  public clearQuestionWithError(order: number) {
    if (this.assignmentDraft.questionsWithErrors === order) {
      this.setQuestionOrderWithError(null);
    }
  }

  @action
  public setContentBlocks(value: Array<ContentBlock>) {
    this._content = value;
  }

  @action
  public removeContentBlock(value: EditableContentBlock) {
    this._content.splice(value.order, 1);
    this._content.map((block, index) => {
      const currentBlock = block as EditableContentBlock;
      return currentBlock.setOrderBlock(index);
    });
    this.clearQuestionWithError(value.orderQuestion);
    this.save();
  }

  @action
  public reorderContentBlocks(oldIndex: number, newIndex: number) {
    const currentContentBlock = this.content[oldIndex];
    const contentBlocks = this.content.slice();
    contentBlocks.splice(oldIndex, 1);
    contentBlocks.splice(newIndex, 0, currentContentBlock);
    contentBlocks.forEach((contentBlock, index) => (contentBlock as EditableContentBlock).setOrderBlock(index));

    this._content = contentBlocks;

    this.save();
  }

  @action
  public addContentBlock(type: ContentBlockType, question: EditableQuestion): void {
    switch (type) {
      case ContentBlockType.Text: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Text)) {
          this._content = this._content.concat(new EditableTextContentBlock({
            question,
            text: '',
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }

      case ContentBlockType.Images: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Images)) {
          this._content.push(new EditableImagesContentBlock({
            question,
            images: [],
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }
      case ContentBlockType.Videos: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Videos)) {
          this._content.push(new EditableVideosContentBlock({
            question,
            videos: [],
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }
      default:
        throw new TypeError(`Unimplemented content block type: ${type}`);
    }
  }

  @action
  public setTitle(value: string): void {
    this.title = value;
    this.save();
  }

  @action
  public setGuidance(value: string): void {
    this._guidance = value;
    this.save();
  }

  @action
  public setQuestionOrderWithError(value: number | null) {
    this.assignmentDraft.setQuestionsWithError(value);
  }

  @action
  public setOrder(order: number): void {
    this._order = order;
    this.save();
  }
}

export interface MultipleChoiceQuestionOptionArgs {
  title: string;
  isRight: boolean;
  question: EditableMultipleChoiceQuestion;
}

export class EditableMultipleChoiceQuestionOption extends MultipleChoiceQuestionOption {

  private question: EditableMultipleChoiceQuestion;

  constructor(title: string, isRight: boolean, question: EditableMultipleChoiceQuestion) {
    super(title, isRight);
    this.question = question;
  }

  public validate() {
    if (!this.title || !this.title.trim().length) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_option_title'
      );
    }
  }
  @computed
  public get isValid() {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

  @computed
  public get title() {
    return this._title;
  }

  public set title(title: string) {
    this._title = title;
  }

  @action
  public setTitle(title: string) {
    this.title = title;
    this.question.save();
  }

  @action
  public setIsRight(value: boolean) {
    this._isRight = value;
    this.question.save();
  }
}

interface MultipleChoiceQuestionParams extends EditableQuestionArgs {
  options: Array<EditableMultipleChoiceQuestionOption>;
  assignmentDraft: DraftAssignment;
}

export class EditableMultipleChoiceQuestion extends MultipleChoiceQuestion implements QuestionActions {

  @observable public _options: Array<EditableMultipleChoiceQuestionOption>;
  public assignmentDraft: DraftAssignment;
  public isValid: boolean = false;
  public _content: Array<ContentBlock>;

  public static fromIndexAndAssignment(index: number, assignmentDraft: DraftAssignment) {
    const question = new EditableMultipleChoiceQuestion({
      assignmentDraft,
      title: '',
      guidance: '',
      order: index,
      options: [],
      contentBlocks: []
    });

    question.setOptions([new EditableMultipleChoiceQuestionOption('', false, question)]);

    return question;
  }

  constructor(params: MultipleChoiceQuestionParams) {
    super({ ...params });
    this._options = params.options;
    this.assignmentDraft = params.assignmentDraft;
    this._content = params.contentBlocks;
  }

  private validateOptionsCount() {
    if (this._options.length < MIN_OPTIONS_COUNT) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.number_of_options'
      );
    }
  }

  private validateOptions() {
    this._options.forEach((option) => {
      option.validate();
    });
    const optionsTitles = this._options.map(option => option.title);
    if (optionsTitles.length !== new Set(optionsTitles).size) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_not_repeating_titles'
      );
    }
  }

  private validateTitle() {
    if (!this.title || this.title.length <= 0) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_title'
      );
    }
  }

  private validateRightOptions() {
    let hasRightAnswers = false;

    this._options.forEach((option) => {
      hasRightAnswers = hasRightAnswers || option.isRight;
    });

    if (!hasRightAnswers) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_one_correct_answer'
      );
    }
  }

  private checkPreviousContentBlock(question: EditableQuestion, type: ContentBlockType): boolean {
    const filteredContentBlocks = question.content.filter(i => i.type === type);
    if (filteredContentBlocks.length <= 0) {
      return true;
    }
    const previousBlock = filteredContentBlocks[filteredContentBlocks.length - 1] ;
    switch (type) {
      case ContentBlockType.Text: {
        const previousFilteredBlock = previousBlock as EditableTextContentBlock;
        if (previousFilteredBlock) {
          return !!previousFilteredBlock.text;
        }
        return true;
      }
      case ContentBlockType.Images: {
        const previousFilteredBlock = previousBlock as EditableImagesContentBlock;
        if (previousFilteredBlock) {
          return previousFilteredBlock.images.length > 0;
        }
        return true;
      }
      case ContentBlockType.Videos: {
        const previousFilteredBlock = previousBlock as EditableVideosContentBlock;
        if (previousFilteredBlock) {
          return previousFilteredBlock.videos.length > 0;
        }
        return true;
      }
      default: return false;
    }
  }

  private validateContentBlocks() {
    return this.content.forEach((block: ContentBlock) => {
      switch (block.type) {
        case ContentBlockType.Text: {
          const currentBlock = block as EditableTextContentBlock;
          let cleanText = currentBlock.text.replace(/<\/?[^>]+(>|$)/g, '');
          cleanText = cleanText.replace(/<\/?[^>]+(>|$)/g, '');
          if (!currentBlock.text.trim() || cleanText.trim() === '') {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        case ContentBlockType.Images: {
          const currentBlock = block as EditableImagesContentBlock;
          if (currentBlock.images.length === 0) {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        case ContentBlockType.Videos: {
          const currentBlock = block as EditableVideosContentBlock;
          if (currentBlock.videos.length === 0) {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        default:
          throw new TypeError(`Unknown content block type: ${block.type}`);
      }
    });
  }

  @computed
  public get options() {
    return this._options;
  }

  public setOptions(value: Array<EditableMultipleChoiceQuestionOption>) {
    this._options = value;
  }

  public save() {
    this.assignmentDraft!.save();
  }

  @action
  public clearQuestionWithError(order: number) {
    if (this.assignmentDraft.questionsWithErrors === order) {
      this.setQuestionOrderWithError(null);
    }
  }

  @action
  public setQuestionOrderWithError(value: number | null) {
    this.assignmentDraft.setQuestionsWithError(value);
  }

  @action
  public setContentBlocks(value: Array<ContentBlock>) {
    this._content = value;
  }

  @action
  public removeContentBlock(value: EditableContentBlock) {
    this._content.splice(value.order, 1);
    this._content.map((block, index) => {
      const currentBlock = block as EditableContentBlock;
      return currentBlock.setOrderBlock(index);
    });
    this.clearQuestionWithError(value.orderQuestion);
    this.save();
  }

  @action
  public reorderContentBlocks(oldIndex: number, newIndex: number) {
    const currentContentBlock = this.content[oldIndex];
    const contentBlocks = this.content.slice();
    contentBlocks.splice(oldIndex, 1);
    contentBlocks.splice(newIndex, 0, currentContentBlock);
    contentBlocks.forEach((contentBlock, index) => (contentBlock as EditableContentBlock).setOrderBlock(index));

    this._content = contentBlocks;

    this.save();
  }

  @action
  public addContentBlock(type: ContentBlockType, question: EditableQuestion): void {
    switch (type) {
      case ContentBlockType.Text: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Text)) {
          this._content.push(new EditableTextContentBlock({
            question,
            text: '',
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }

      case ContentBlockType.Images: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Images)) {
          this._content.push(new EditableImagesContentBlock({
            question,
            images: [],
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }
      case ContentBlockType.Videos: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Videos)) {
          this._content.push(new EditableVideosContentBlock({
            question,
            videos: [],
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }
      default:
        throw new TypeError(`Unimplemented content block type: ${type}`);
    }
  }

  @action
  public setTitle(value: string): void {
    this._title = value;
    this.save();
  }

  @action
  public setGuidance(value: string): void {
    this._guidance = value;
    this.save();
  }

  @action
  public setOrder(order: number): void {
    this._order = order;
    this.save();
  }

  public validate() {
    this.validateTitle();
    this.validateOptionsCount();
    this.validateOptions();
    this.validateRightOptions();
    this.validateContentBlocks();
  }

  @computed
  public get hasEnoughOptionsAndRightOptions() {
    try {
      this.validateOptionsCount();
      this.validateRightOptions();
      return true;
    } catch (e) {
      return false;
    }
  }

  public deleteOption(index: number) {
    this._options = this._options.filter(
      option => option !== this._options[index]
    );

    this.save();
  }

  @action
  public addNewOption() {
    this._options.push(new EditableMultipleChoiceQuestionOption('', false, this));
    this._options = this._options.slice();

    this.save();
  }

  @action
  public reorderOptions(oldIndex: number, newIndex: number) {
    const currentOrder = this._options[oldIndex];
    const options = this._options.slice();
    options.splice(oldIndex, 1);
    options.splice(newIndex, 0, currentOrder);

    this._options = options;

    this.save();
  }

  public duplicateWithOrder(order: number): EditableQuestion {
    const newQuestion = new EditableMultipleChoiceQuestion({
      order,
      assignmentDraft: this.assignmentDraft!,
      title: this.title,
      guidance: this.guidance,
      options: this._options,
      contentBlocks: this._content.map(item => cloneDeep(item))
    });

    newQuestion.setOptions(this._options.map(option => new EditableMultipleChoiceQuestionOption(option.title, option.isRight, newQuestion)));
    return newQuestion;
  }
}

export class EditableImageChoiceQuestionOption extends ImageChoiceQuestionOption {

  public question: EditableImageChoiceQuestion;

  constructor(
    title: string,
    image: QuestionAttachment | undefined,
    orderPosition: number,
    isRight: boolean,
    question: EditableImageChoiceQuestion
  ) {
    super(title, image, orderPosition, isRight);
    this.question = question;
  }

  public validate() {
    if (!this.title || !this.title.trim().length) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_option_title'
      );
    }
    if (!this.image) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_option_image'
      );
    }
  }

  @computed
  public get isValid() {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

  public set title(title: string) {
    this._title = title;
  }

  public set image(image: QuestionAttachment) {
    this._image = image;
  }

  @action
  public setOrder(order: number) {
    this._orderPosition = order;
    this.question.save();
  }

  @action
  public setTitle(title: string) {
    this._title = title;
    this.question.save();
  }

  @action
  public setImage(image: QuestionAttachment) {
    this._image = image;
    this.question.save();
  }

  @action
  public removeImage() {
    this._image = undefined;
    this.question.save();
    this.question.options = this.question.options.slice();
  }

  @action
  public setIsRight(value: boolean) {
    this._isRight = value;
    this.question.save();
  }
}

interface ImageChoiceQuestionParams extends EditableQuestionArgs {
  options: Array<EditableImageChoiceQuestionOption>;
  assignmentDraft: DraftAssignment;
}

export class EditableImageChoiceQuestion extends ImageChoiceQuestion implements QuestionActions {

  @observable public _options: Array<EditableImageChoiceQuestionOption>;
  public assignmentDraft: DraftAssignment;
  public isValid: boolean = false;
  public _content: Array<ContentBlock>;

  constructor(params: ImageChoiceQuestionParams) {
    super({ ...params });
    this._options = params.options;
    this.assignmentDraft = params.assignmentDraft;
    this._content = params.contentBlocks;
  }

  public static fromIndexAndAssignment(index: number, assignmentDraft: DraftAssignment) {
    const question = new EditableImageChoiceQuestion({
      assignmentDraft,
      title: '',
      guidance: '',
      order: index,
      options: [],
      contentBlocks: []
    });

    question.options = [new EditableImageChoiceQuestionOption('', undefined, 0, false, question)];

    return question;
  }

  public set title(title: string) {
    this._title = title;
  }

  public set options(value) {
    this._options = value;
  }

  @computed
  public get options() {
    return this._options;
  }

  @computed
  public get title() {
    return this._title;
  }

  public set guidance(value: string) {
    this._guidance = value;
  }

  @computed
  public get guidance() {
    return this._guidance;
  }

  private validateOptionsCount() {
    if (this._options.length < MIN_OPTIONS_COUNT) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.number_of_options'
      );
    }
  }

  private validateOptions() {
    this._options.forEach((option) => {
      option.validate();
    });
    const optionsTitles = this._options.map(option => option.title);
    if (optionsTitles.length !== new Set(optionsTitles).size) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_not_repeating_titles'
      );
    }
  }

  private validateTitle() {
    if (!this.title || this.title.length <= 0) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_title'
      );
    }
  }

  private validateRightOptions() {
    let hasRightAnswers = false;

    this._options.forEach((option) => {
      hasRightAnswers = hasRightAnswers || option.isRight;
    });

    if (!hasRightAnswers) {
      throw new AssignmentValidationError(
        'new assignment.validation.question.required_one_correct_answer'
      );
    }
  }

  private validateContentBlocks() {
    return this.content.forEach((block: ContentBlock) => {
      switch (block.type) {
        case ContentBlockType.Text: {
          const currentBlock = block as EditableTextContentBlock;
          let cleanText = currentBlock.text.replace(/<\/?[^>]+(>|$)/g, '');
          cleanText = cleanText.replace(/<\/?[^>]+(>|$)/g, '');
          if (!currentBlock.text.trim() || cleanText.trim() === '') {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        case ContentBlockType.Images: {
          const currentBlock = block as EditableImagesContentBlock;
          if (currentBlock.images.length === 0) {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        case ContentBlockType.Videos: {
          const currentBlock = block as EditableVideosContentBlock;
          if (currentBlock.videos.length === 0) {
            this.setQuestionOrderWithError(currentBlock.orderQuestion);
            throw new AssignmentValidationError(
              'new assignment.validation.question.required_all_fields'
            );
          }
          this.setQuestionOrderWithError(null);
          break;
        }
        default:
          throw new TypeError(`Unknown content block type: ${block.type}`);
      }
    });
  }

  private checkPreviousContentBlock(question: EditableQuestion, type: ContentBlockType): boolean {
    const filteredContentBlocks = question.content.filter(i => i.type === type);
    if (filteredContentBlocks.length <= 0) {
      return true;
    }
    const previousBlock = filteredContentBlocks[filteredContentBlocks.length - 1] ;
    switch (type) {
      case ContentBlockType.Text: {
        const previousFilteredBlock = previousBlock as EditableTextContentBlock;
        if (previousFilteredBlock) {
          return !!previousFilteredBlock.text;
        }
        return true;
      }
      case ContentBlockType.Images: {
        const previousFilteredBlock = previousBlock as EditableImagesContentBlock;
        if (previousFilteredBlock) {
          return previousFilteredBlock.images.length > 0;
        }
        return true;
      }
      case ContentBlockType.Videos: {
        const previousFilteredBlock = previousBlock as EditableVideosContentBlock;
        if (previousFilteredBlock) {
          return previousFilteredBlock.videos.length > 0;
        }
        return true;
      }
      default: return false;
    }
  }

  public save() {
    this.assignmentDraft!.save();
  }

  @action
  public clearQuestionWithError(order: number) {
    if (this.assignmentDraft.questionsWithErrors === order) {
      this.setQuestionOrderWithError(null);
    }
  }

  @action
  public setQuestionOrderWithError(value: number | null) {
    this.assignmentDraft.setQuestionsWithError(value);
  }

  @action
  public setContentBlocks(value: Array<ContentBlock>) {
    this._content = value;
  }

  @action
  public removeContentBlock(value: EditableContentBlock) {
    this._content.splice(value.order, 1);
    this._content.map((block, index) => {
      const currentBlock = block as EditableContentBlock;
      return currentBlock.setOrderBlock(index);
    });
    this.clearQuestionWithError(value.orderQuestion);
    this.save();
  }

  @action
  public reorderContentBlocks(oldIndex: number, newIndex: number) {
    const currentContentBlock = this.content[oldIndex];
    const contentBlocks = this.content.slice();

    contentBlocks.splice(oldIndex, 1);
    contentBlocks.splice(newIndex, 0, currentContentBlock);
    contentBlocks.forEach((contentBlock, index) => (contentBlock as EditableContentBlock).setOrderBlock(index));

    this._content = contentBlocks;

    this.save();
  }

  @action
  public addContentBlock(type: ContentBlockType, question: EditableQuestion): void {
    switch (type) {
      case ContentBlockType.Text: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Text)) {
          this._content.push(new EditableTextContentBlock({
            question,
            text: '',
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }

      case ContentBlockType.Images: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Images)) {
          this._content.push(new EditableImagesContentBlock({
            question,
            images: [],
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }

      case ContentBlockType.Videos: {
        if (this.checkPreviousContentBlock(question, ContentBlockType.Videos)) {
          this._content.push(new EditableVideosContentBlock({
            question,
            videos: [],
            order: this._content.length,
          }
          ));
          break;
        }
        break;
      }
      default:
        throw new TypeError(`Unimplemented content block type: ${type}`);
    }
  }

  @action
  public setTitle(value: string): void {
    this._title = value;
    this.save();
  }

  @action
  public setGuidance(value: string): void {
    this._guidance = value;
    this.save();
  }

  @action
  public setOrder(order: number): void {
    this._order = order;
    this.save();
  }

  public validate() {
    this.validateTitle();
    this.validateOptionsCount();
    this.validateOptions();
    this.validateRightOptions();
    this.validateContentBlocks();
  }

  @computed
  public get hasEnoughOptionsAndRightOptions() {
    try {
      this.validateOptionsCount();
      this.validateRightOptions();
      return true;
    } catch (e) {
      return false;
    }
  }

  public deleteOption(index: number) {
    this._options = this._options.filter(
      option => option !== this._options[index]
    );

    this.save();
  }

  @action
  public addNewOption() {
    this._options.push(new EditableImageChoiceQuestionOption(
      '',
      undefined,
      this._options.length,
      false, this
    ));
    this._options = this._options.slice();

    this.save();
  }

  @action
  public reorderOptions(oldIndex: number, newIndex: number) {
    const currentOrder = this._options[oldIndex];
    const options = this._options.slice();
    options.splice(oldIndex, 1);
    options.splice(newIndex, 0, currentOrder);
    options.forEach((i, index) => i.setOrder(index));
    this._options = options;
    this.save();
  }

  public duplicateWithOrder(order: number): EditableQuestion {
    const newQuestion = new EditableImageChoiceQuestion({
      order,
      assignmentDraft: this.assignmentDraft!,
      title: this.title,
      guidance: this.guidance,
      options: this._options,
      contentBlocks: this._content.map(item => cloneDeep(item))
    });

    newQuestion.options = this._options.map(option =>
      new EditableImageChoiceQuestionOption(option.title, option.image, option.order, option.isRight, newQuestion));
    return newQuestion;
  }
}

export class AssignmentValidationError extends Error {
  public readonly localizationKey: string;

  constructor(localizationKey: string) {
    super(localizationKey);
    this.localizationKey = localizationKey;
  }
}

export class QuestionImagesOverflowError extends Error {
  public readonly localizationKey: string;

  constructor(localizationKey: string) {
    super(localizationKey);
    this.localizationKey = localizationKey;
  }
}

export class AlreadyEditingAssignmentError extends Error {}
