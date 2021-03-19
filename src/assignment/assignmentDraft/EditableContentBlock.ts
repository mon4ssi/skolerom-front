import { action, computed } from 'mobx';
import { ImageContentBlock, TextContentBlock, VideoContentBlock } from '../ContentBlock';
import { EditableQuestion, QuestionImagesOverflowError } from './AssignmentDraft';
import { QuestionAttachment } from '../Assignment';

const MAX_QUESTIONS_COUNT = 20;
const MAX_VIDEOS_COUNT = 10;

interface ContentBlockAction {
  setOrderBlock: (value: number) => void;
}
export type EditableContentBlock = EditableTextContentBlock | EditableImagesContentBlock | EditableVideosContentBlock;

export class EditableTextContentBlock extends TextContentBlock implements ContentBlockAction {
  private readonly _question: EditableQuestion;

  constructor(params: {
    text: string,
    order: number,
    question: EditableQuestion
  }) {
    super({ ...params });
    this._text = params.text;
    this._question = params.question;
    this._order = params.order;
  }

  @computed
  public get orderQuestion() {
    return this._question.orderPosition;
  }

  @action
  public setOrderBlock(value: number) {
    this._order = value;
  }

  @action
  public setText(value: string) {
    this._text = value;
    if (this._question.assignmentDraft.questionsWithErrors === this._question.orderPosition) {
      this._question.assignmentDraft.setQuestionsWithError(null);
    }
    this._question.save();
  }
}

export class EditableImagesContentBlock extends ImageContentBlock implements ContentBlockAction {
  private readonly _question: EditableQuestion;

  constructor(params: {
    images: Array<QuestionAttachment>
    order: number,
    question: EditableQuestion
  }) {
    super({ ...params });
    this._images = params.images;
    this._question = params.question;
    this._order = params.order;
  }

  @computed
  public get orderQuestion() {
    return this._question.orderPosition;
  }

  @action
  public setOrderBlock(value: number) {
    this._order = value;
  }

  @action
  public addImageToContentBlock(image: QuestionAttachment) {
    if (this._images.length >= MAX_QUESTIONS_COUNT) {
      throw new QuestionImagesOverflowError('new assignment.validation.question.number_of_images');
    }
    this._images = this._images.concat(image);
    if (this._question.assignmentDraft.questionsWithErrors === this._question.orderPosition) {
      this._question.assignmentDraft.setQuestionsWithError(null);
    }
    this._question.save();
  }

  @action
  public removeImage(id: number): void {
    this._images = this._images.filter(image => image.id !== id);
    this._question.save();
  }

}

export class EditableVideosContentBlock extends VideoContentBlock implements ContentBlockAction{
  private readonly _question: EditableQuestion;

  constructor(params: {
    videos: Array<QuestionAttachment>
    order: number,
    question: EditableQuestion
  }) {
    super({ ...params });
    this._videos = params.videos;
    this._question = params.question;
    this._order = params.order;
  }

  @computed
  public get orderQuestion() {
    return this._question.orderPosition;
  }

  @action
  public setOrderBlock(value: number) {
    this._order = value;
  }

  @action
  public addVideoToContentBlock(video: QuestionAttachment) {
    if (this._videos.length >= MAX_VIDEOS_COUNT) {
      throw new QuestionImagesOverflowError('new assignment.validation.question.number_of_videos');
    }
    this._videos = this._videos.concat(video);
    if (this._question.assignmentDraft.questionsWithErrors === this._question.orderPosition) {
      this._question.assignmentDraft.setQuestionsWithError(null);
    }
    this._question.save();
  }

  @action
  public removeVideo(id: number): void {
    this._videos = this._videos.filter((video: QuestionAttachment) => video.id !== id);
    this._question.save();
  }
}
