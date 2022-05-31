import { computed, observable } from 'mobx';
import { QuestionAttachment } from './Assignment';

export enum ContentBlockType {
  Text = 'TEXT',
  Images = 'IMAGES',
  CustomImages = 'CUSTOMIMGS',
  Videos = 'VIDEOS'
}

export abstract class ContentBlock {
  public readonly type: ContentBlockType;
  @observable protected _order: number;

  protected constructor(params: { order: number, type: ContentBlockType }) {
    this.type = params.type;
    this._order = params.order;
  }

  @computed
  public get order(): number {
    return this._order;
  }
}

export class TextContentBlock extends ContentBlock {
  @observable protected _text: string;

  constructor(params: { text: string, order: number }) {
    super({ order: params.order, type: ContentBlockType.Text });
    this._text = params.text;
  }

  @computed
  public get text(): string {
    return this._text;
  }
}

export class ImageContentBlock extends ContentBlock{
  @observable protected _images: Array<QuestionAttachment>;

  constructor(params: { order: number, images: Array<QuestionAttachment> }) {
    super({ type: ContentBlockType.Images, order: params.order });
    this._images = params.images;
  }

  @computed
  public get images(): Array<QuestionAttachment> {
    return this._images;
  }
}

export class VideoContentBlock extends ContentBlock{
  @observable protected _videos: Array<QuestionAttachment>;

  constructor(params: { order: number, videos: Array<QuestionAttachment>}) {
    super({ type: ContentBlockType.Videos, order: params.order });
    this._videos = params.videos;
  }

  @computed
  public get videos(): Array<QuestionAttachment> {
    return this._videos;
  }
}
