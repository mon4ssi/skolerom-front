import React, { Component, SyntheticEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { SortableElement, SortableContainer, SortableHandle } from 'react-sortable-hoc';

import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import {
  EditableContentBlock,
  EditableImagesContentBlock,
  EditableTextContentBlock, EditableVideosContentBlock
} from 'assignment/assignmentDraft/EditableContentBlock';
import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { DescriptionEditor } from './DescriptionEditor';
import { QuestionAttachment } from 'assignment/Assignment';
import { ContentBlockType, ContentBlock } from '../../../ContentBlock';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import drag from 'assets/images/drag.svg';
import trash from 'assets/images/trash.svg';
import play from 'assets/images/play.svg';

import './Questions.scss';

interface ContentBlockProps {
  item: ContentBlock;
  index: number;
  isCurrent: boolean;
  question: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

const DragIcon = SortableHandle(() => (
  <button title="drag">
    <img src={drag} alt="drag" title="drag"/>
  </button>
));
@inject('newAssignmentStore')
@observer
class ContentBlockComponent extends Component<ContentBlockProps> {

  public static contextType = AttachmentContentTypeContext;

  public state = {
    isHovered: false
  };

  private setCurrentBlock = (block: EditableContentBlock) => (e: SyntheticEvent) => {
    const { question } = this.props;

    e.stopPropagation();

    switch (block.type) {
      case ContentBlockType.Text:
        this.context.changeContentType(AttachmentContentType.text);
        break;
      case ContentBlockType.Images:
        this.context.changeContentType(AttachmentContentType.image);
        this.props.newAssignmentStore!.clearCurrentOption();
        break;
      case ContentBlockType.Videos:
        this.context.changeContentType(AttachmentContentType.video);
        this.props.newAssignmentStore!.clearCurrentOption();
        break;
      default:
        throw new TypeError(`Unknown content type: ${block.type}`);
    }
    this.props.newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    this.props.newAssignmentStore!.setCurrentContentBlock(question.orderPosition, block.order);
    this.props.newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  private changeTextContentBlock = (block: EditableTextContentBlock) => (value: string) => {
    block.setText(value);
  }

  private renderImage = (image: QuestionAttachment) => {
    /* console.log(image) */
    const alt = image.path
      .split('/')
      .pop()!
      .split('.')[0];

    return (
      <img
        key={image.id}
        src={image.path}
        alt={alt}
        className="questionImageThumbnail"
      />
    );
  }

  private showImages = (block: EditableImagesContentBlock) => {
    if (block.images.length > 0) {
      return block.images.map(this.renderImage);
    }
    return <span className={'placeholderImage'}>{intl.get('new assignment.chose_an_images')}</span>;
  }

  private showVideos = (block: EditableVideosContentBlock) => {
    if (block.videos.length > 0) {
      return block.videos.map(this.renderVideo);
    }
    return <span className={'placeholderImage'}>{intl.get('new assignment.chose_an_videos')}</span>;
  }

  private renderVideo = (video: QuestionAttachment) => (
    <div className={'videoContent'}>
      <div className={'playButton'}>
        <img src={play} alt="play" className={'playButton'}/>
      </div>
      <video key={video.id} width="100%" height="100%">
        <source src={video.path} type="video/mp4"/>
      </video>
    </div>
  )

  private renderActionButtons = (block: EditableContentBlock, activeBlock: string) => {
    const hoveredClass = this.state.isHovered ? 'hovered' : '';

    return (
      <div className={`blockActions ${activeBlock} ${hoveredClass}`}>
        <DragIcon />
        <button onClick={this.removeContentBlock(block)} title="trash">
          <img src={trash} alt="trash" title="trash" />
        </button>
      </div>
    );
  }

  private handleHover = () => {
    this.setState({ isHovered: !this.state.isHovered });
  }

  private renderTextBlock = (block: EditableTextContentBlock, index: number) => {
    let activeBlock = '';
    if (this.props.isCurrent) {
      activeBlock = 'activeBlock';
    }
    return (
      <div
        key={index}
        className={`textDecorator ${activeBlock}`}
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleHover}
      >
        <div className="textContent" onClick={this.setCurrentBlock(block)}>
          <DescriptionEditor
            description={block.text}
            onChange={this.changeTextContentBlock(block)}
          />
        </div>
        {this.renderActionButtons(block, activeBlock)}
      </div>
    );
  }

  private renderImageBlock = (block: EditableImagesContentBlock, index: number) => {
    let activeBlock = '';

    if (this.props.isCurrent) {
      activeBlock = 'activeBlock';
    }
    return (
      <div
        key={index}
        className={`attached-files ${activeBlock}`}
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleHover}
      >
        <div className="imageContent" onClick={this.setCurrentBlock(block)}>
          {this.showImages(block)}
        </div>
        {this.renderActionButtons(block, activeBlock)}
      </div>
    );
  }

  private renderVideoBlock = (block: EditableVideosContentBlock, index: number) => {
    let activeBlock = '';
    if (this.props.isCurrent) {
      activeBlock = 'activeBlock';
    }
    return (
      <div
        key={index}
        className={`attached-files ${activeBlock}`}
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleHover}
      >
        <div className="imageContent" onClick={this.setCurrentBlock(block)}>
          {this.showVideos(block)}
        </div>
        {this.renderActionButtons(block, activeBlock)}
      </div>
    );
  }

  public removeContentBlock = (block: EditableContentBlock) => async () => {
    if (await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('notifications.delete_question')
    })) {
      this.context.changeContentType(AttachmentContentType.text);
      this.props.question.removeContentBlock(block);
    }
  }

  public render() {
    const { item, index } = this.props;

    switch (item.type) {
      case ContentBlockType.Text: {
        const block = item as EditableTextContentBlock;
        return this.renderTextBlock(block, index);
      }
      case ContentBlockType.Images: {
        const block = item as EditableImagesContentBlock;
        return this.renderImageBlock(block, index);
      }
      case ContentBlockType.Videos: {
        const block = item as EditableVideosContentBlock;
        return this.renderVideoBlock(block, index);
      }
      default:
        throw new TypeError(`Unknown content block type: ${item.type}`);
    }
  }
}

const DraggableContentBlock = SortableElement(ContentBlockComponent);

interface Props {
  question: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
export class MappingContentBlocksComponent extends Component<Props>{
  public static contextType = AttachmentContentTypeContext;

  private isCurrent = (block: EditableContentBlock) => {
    const { newAssignmentStore, question } = this.props;
    const isCurrentBlock = newAssignmentStore!.currentBlock.orderBlock === block.order;
    const isCurrentQuestion = newAssignmentStore!.currentBlock.orderQuestion === question.orderPosition;

    return isCurrentBlock && isCurrentQuestion;
  }

  public renderContentBlock = (item: ContentBlock, index: number) => {
    const { question } = this.props;

    const isCurrent = this.isCurrent(item as EditableContentBlock);

    return (
      <DraggableContentBlock
        key={`key-${item.order}-${index}`}
        item={item}
        index={index}
        isCurrent={isCurrent}
        question={question}
      />
    );
  }

  public render() {
    const { question } = this.props;

    return (
      <div>
        {question.content.map(this.renderContentBlock)}
      </div>
    );
  }
}

export const MappingContentBlocks = SortableContainer(MappingContentBlocksComponent);
