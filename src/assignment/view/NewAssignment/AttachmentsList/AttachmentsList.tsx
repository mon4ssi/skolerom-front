import React, { ChangeEvent, Component, createRef } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { IReactionDisposer, reaction } from 'mobx';
import isNull from 'lodash/isNull';

import { NewAssignmentStore } from '../NewAssignmentStore';
import { AttachmentComponent } from './Attachment';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import { EditableImageChoiceQuestion, QuestionImagesOverflowError } from 'assignment/assignmentDraft/AssignmentDraft';
import { Attachment, QuestionAttachment, QuestionType } from '../../../Assignment';
import { EditableImagesContentBlock, EditableVideosContentBlock } from 'assignment/assignmentDraft/EditableContentBlock';
import { ImageAttachments } from './Attachments/ImageAttachments';
import { VideosAttachments } from './Attachments/VideosAttachments';
import { lettersNoEn } from 'utils/lettersNoEn';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { ContentBlockType } from '../../../ContentBlock';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import closeCross from 'assets/images/close-rounded-black.svg';
import searchIcon from 'assets/images/search.svg';

import './AttachmentsList.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { CustomImageAttachments } from './Attachments/CustomImageAttachments';
import { CustomImageForm } from './CustomImageForm/CustomImageForm';
import { UserType } from 'user/User';

export interface AttachmentsListProps {
  context: {
    contentType: AttachmentContentType;
    changeContentType: (type: AttachmentContentType) => void;
  };
  newAssignmentStore?: NewAssignmentStore;
}

interface State {
  selectedTab: string;
  selectedTabId: number;
  query: string;
  errMsg: string;
}

export interface FilterableAttachment {
  id: number;
  path: string;
  title: string;
  fileName: string;
  alt: string;
  duration?: number;
  src?: Array<string>;
}

@inject('newAssignmentStore')
@observer
class AttachmentsListComponent extends Component<AttachmentsListProps, State> {
  public static contextType = AttachmentContentTypeContext;
  public refButton = createRef<HTMLButtonElement>();
  public reaction: IReactionDisposer | null = null;
  public state: State = {
    selectedTab: '',
    query: '',
    selectedTabId: 0,
    errMsg: '',
  };

  public TWO = 2;
  public THREE = 3;

  private async fetchAttachments(): Promise<void> {
    const { newAssignmentStore } = this.props;
    try {
      if (this.context.contentType === AttachmentContentType.image) {
        await newAssignmentStore!.fetchQuestionAttachments(AttachmentContentType.image);
      }
      if (this.context.contentType === AttachmentContentType.customImage) {
        await newAssignmentStore!.fetchQuestionCustomImagesAttachments(AttachmentContentType.customImage);
      }
      if (this.context.contentType === AttachmentContentType.video) {
        await newAssignmentStore!.fetchQuestionAttachments(AttachmentContentType.video);
      }
    } catch (e) {
      const KEY_SEPARATOR = 2;
      this.setState({ errMsg: e.message.split(': ')[KEY_SEPARATOR] });
    }
  }

  private handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    if (lettersNoEn(e.target.value)) {
      this.setState({ query: e.target.value.toLowerCase() });
    }
  }

  private getSelectedOptionsFromImageChoice = (id: number) => {
    const { newAssignmentStore } = this.props;

    const currentQuestion = newAssignmentStore!.currentQuestion as EditableImageChoiceQuestion;
    const currentOption = newAssignmentStore!.currentOrderOption;
    return (currentQuestion && currentQuestion.options && currentQuestion.options[currentOption].image)
      && currentQuestion.options[currentOption].image.id === id;
  }

  private getSelectedAttachments = (id: number) => {
    const { newAssignmentStore } = this.props;

    if (this.context.contentType === AttachmentContentType.image) {
      const editableImageBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (editableImageBlock && editableImageBlock.images && editableImageBlock.images.length > 0) {
        return editableImageBlock.images.some(item => item.id === id);
      }
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      const editableImageBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (editableImageBlock && editableImageBlock.images && editableImageBlock.images.length > 0) {
        return editableImageBlock.images.some(item => item.id === id);
      }
    }
    if (this.context.contentType === AttachmentContentType.video) {
      const editableVideoBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableVideosContentBlock;
      if (editableVideoBlock && editableVideoBlock.videos && editableVideoBlock.videos.length > 0) {
        return editableVideoBlock.videos.some(item => item.id === id);
      }
    }
    return false;
  }

  private checkIsAttachmentSelected = (id: number): boolean => {
    const { newAssignmentStore } = this.props;

    if (newAssignmentStore!.currentOrderOption >= 0) {
      return this.getSelectedOptionsFromImageChoice(id);
    }
    return this.getSelectedAttachments(id);
  }

  private addAttachmentToContentBlock = (attachment: Attachment) => {
    const { newAssignmentStore } = this.props;

    if (this.context.contentType === AttachmentContentType.image) {
      if (newAssignmentStore!.currentOrderOption >= 0) {
        return newAssignmentStore!.setImageCurrentOption(attachment);
      }
      const editableImageBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      return editableImageBlock && editableImageBlock.addImageToContentBlock(attachment);
    }

    if (this.context.contentType === AttachmentContentType.customImage) {
      if (newAssignmentStore!.currentOrderOption >= 0) {
        return newAssignmentStore!.setImageCurrentOption(attachment);
      }
      const editableImageBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      return editableImageBlock && editableImageBlock.addImageToContentBlock(attachment);
    }

    if (this.context.contentType === AttachmentContentType.video) {
      const editableVideoBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableVideosContentBlock;
      return editableVideoBlock && editableVideoBlock.addVideoToContentBlock(attachment);
    }
  }

  private onSelectAttachment = async (id: number) => {
    const { newAssignmentStore } = this.props;
    const attachment = newAssignmentStore!.questionAttachmentsList.find(item => item.id === id);
    if (attachment) {
      try {
        await newAssignmentStore!.saveAttachment(attachment.id);
        this.addAttachmentToContentBlock(attachment);
      } catch (e) {
        if (e instanceof QuestionImagesOverflowError) {
          Notification.create({
            type: NotificationTypes.ERROR,
            title: intl.get(e.localizationKey)
          });
        }
      }
    }
  }

  private onRemoveAttachment = async (id: number) => {
    const { newAssignmentStore } = this.props;

    if (this.context.contentType === AttachmentContentType.image) {
      const editableImageBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (editableImageBlock) {
        const image: QuestionAttachment | undefined = editableImageBlock.images.find(im => im.id === id);

        if (image) {
          editableImageBlock.removeImage(image.id);
          await this.props.newAssignmentStore!.removeAttachment(image.id);
        }
      }
    }

    if (this.context.contentType === AttachmentContentType.video) {
      const editableVideoBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableVideosContentBlock;
      const video = editableVideoBlock!.videos.find(video => video.id === id);
      if (video) {
        editableVideoBlock.removeVideo(video.id);
        await this.props.newAssignmentStore!.removeAttachment(video.id);
      }

    }
  }

  private renderAttachment = (item: FilterableAttachment) => {
    const isSelected = this.checkIsAttachmentSelected(item.id);
    return (
      <AttachmentComponent
        key={item.id}
        attachment={item}
        onRemove={this.onRemoveAttachment}
        onSelect={this.onSelectAttachment}
        isSelected={isSelected}
      />
    );
  }

  private filterAttachments = (attachment: FilterableAttachment): boolean => {
    const { query } = this.state;
    const buffer = [
      attachment.title || '',
      attachment.fileName || '',
      attachment.alt || '',
    ];

    return buffer.map(str => str.toLowerCase()).join('_').includes(query);
  }

  private getSortedAttachments = (attachmentA: FilterableAttachment, attachmentB: FilterableAttachment) => {
    if (this.context.contentType === AttachmentContentType.image) {
      const currentBlock = this.props.newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (currentBlock && currentBlock.images && currentBlock.images.length > 0) {
        const isSelectedA = currentBlock.images.findIndex(image => image.id === attachmentA.id);
        const isSelectedB = currentBlock.images.findIndex(image => image.id === attachmentB.id);
        if (isSelectedA >= 0 && isSelectedB >= 0) {
          return isSelectedA - isSelectedB;
        }
        return isSelectedA >= 0 ? -1 : 1;
      }
    }

    if (this.context.contentType === AttachmentContentType.customImage) {
      const currentBlock = this.props.newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      if (currentBlock && currentBlock.images && currentBlock.images.length > 0) {
        const isSelectedA = currentBlock.images.findIndex(image => image.id === attachmentA.id);
        const isSelectedB = currentBlock.images.findIndex(image => image.id === attachmentB.id);
        if (isSelectedA >= 0 && isSelectedB >= 0) {
          return isSelectedA - isSelectedB;
        }
        return isSelectedA >= 0 ? -1 : 1;
      }
    }

    if (this.context.contentType === AttachmentContentType.video) {
      const currentBlock = this.props.newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableVideosContentBlock;
      if (currentBlock && currentBlock.videos && currentBlock.videos.length > 0) {
        const isSelectedA = currentBlock.videos.findIndex(video => video.id === attachmentA.id);
        const isSelectedB = currentBlock.videos.findIndex(video => video.id === attachmentB.id);
        if (isSelectedA >= 0 && isSelectedB >= 0) {
          return isSelectedA - isSelectedB;
        }
        return isSelectedA >= 0 ? -1 : 1;
      }
    }
    return 0;
  }

  private sortAttachments = (attachmentA: FilterableAttachment, attachmentB: FilterableAttachment): number => {
    const { newAssignmentStore } = this.props;

    if (newAssignmentStore!.currentOrderOption >= 0) {
      const currentQuestion = newAssignmentStore!.currentQuestion as EditableImageChoiceQuestion;
      if (currentQuestion && currentQuestion.options && currentQuestion.options[newAssignmentStore!.currentOrderOption].image !== undefined) {
        const isSelectedA = currentQuestion.options[newAssignmentStore!.currentOrderOption].image.id === attachmentA.id ? 1 : -1;
        return isSelectedA >= 0 ? -1 : 1;
      }
      return 0;
    }
    return this.getSortedAttachments(attachmentA, attachmentB);
  }

  private renderSkeletonItem = (className: string, index: number) => (
    <SkeletonLoader
      key={index}
      className={className}
    />
  )

  private renderSearchBar = () => {
    const { selectedTabId } = this.state;
    const { query } = this.state;

    if (selectedTabId !== this.THREE) {
      return (
        <div className="search-field-block">
          <input
            className="search-input"
            type="text"
            name="query"
            placeholder={this.renderPlaceholder()}
            value={query}
            onChange={this.handleSearch}
            aria-required="true"
            aria-invalid="false"
          />
          <img src={searchIcon} alt="search-icon" />
        </div>
      );
    }
  }

  private renderSkeletonLoader = () => {
    const { arrayForImagesSkeleton, arrayForVideosSkeleton } = this.props.newAssignmentStore!;

    switch (this.context.contentType) {
      case (AttachmentContentType.image):
        return (
          <div className="skeleton-images-attachments-list">
            {arrayForImagesSkeleton.map(this.renderSkeletonItem)}
          </div>
        );
      case (AttachmentContentType.customImage):
        return (
          <div className="skeleton-images-attachments-list">
            {arrayForImagesSkeleton.map(this.renderSkeletonItem)}
          </div>
        );
      case (AttachmentContentType.video):
        return (
          <div className="skeleton-videos-attachments-list">
            {arrayForVideosSkeleton.map(this.renderSkeletonItem)}
          </div>
        );
      default:
        return null;
    }
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const classDivPath = (event.composedPath()[0] as Element).className;
    const htmlPathArea = String(event.composedPath()[0]);
    const htmlText = '[object HTMLTextAreaElement]';
    const inputText = '[object HTMLInputElement]';
    const qlEditorText = 'ql-editor';
    if (event.key === 'Escape') {
      this.props.context.changeContentType(AttachmentContentType.text);
      this.props.newAssignmentStore!.clearCurrentOption();
    }
    if ((event.shiftKey && event.key === 'A') || (event.shiftKey && event.key === 'a')) {
      if (htmlPathArea !== htmlText && htmlPathArea !== inputText && classDivPath !== qlEditorText) {
        this.props.context.changeContentType(AttachmentContentType.text);
        this.props.newAssignmentStore!.clearCurrentOption();
      }
    }
  }

  public closeAttachmentsList = () => {
    this.props.context.changeContentType(AttachmentContentType.text);
    this.props.newAssignmentStore!.clearCurrentOption();
    this.props.newAssignmentStore!.visibilityAttachments = false;
  }

  public async componentDidMount() {
    if (this.refButton.current) {
      this.refButton.current!.focus();
    }
    document.addEventListener('keyup', this.handleKeyboardControl);
    await this.fetchAttachments();
    this.reaction = reaction(() => {
      if (!isNull(this.props.newAssignmentStore!.currentEntity!.relatedArticles)) {
        return this.props.newAssignmentStore!.currentEntity!.relatedArticles;
      }
    }, () => { this.fetchAttachments(); });
    this.props.newAssignmentStore!.visibilityAttachments = true;
  }

  public componentWillUnmount() {
    if (this.reaction) {
      this.reaction();
    }
    this.closeAttachmentsList();
    document.removeEventListener('keyup', this.handleKeyboardControl);
    this.props.newAssignmentStore!.visibilityAttachments = false;
  }

  public async componentDidUpdate(prevProps: AttachmentsListProps) {
    const { context } = this.props;
    if (prevProps.context.contentType !== context.contentType) {
      await this.fetchAttachments();
    }
  }

  public renderSelectedAttachmentsCount = () => {
    const { newAssignmentStore } = this.props;
    const currentQuestion = newAssignmentStore!.currentQuestion;
    let placeholder = '';

    // counter for image choice
    if (currentQuestion && currentQuestion.type === QuestionType.ImageChoice) {
      const question = currentQuestion as EditableImageChoiceQuestion;
      const optionImage = question.options[newAssignmentStore!.getCurrentOption];

      if (optionImage && optionImage.image) {
        return `1 ${intl.get('new assignment.images_selected')}`;
      }
      if (optionImage) {
        return `0 ${intl.get('new assignment.images_selected')}`;
      }
    }

    // counter for single image or video
    if (this.context.contentType === AttachmentContentType.image) {
      const currentBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableImagesContentBlock;
      placeholder = intl.get('new assignment.images_selected');

      if (currentBlock && currentBlock.images && currentBlock.images.length) {
        return `${currentBlock.images.length} ${placeholder}`;
      }
    }
    if (this.context.contentType === AttachmentContentType.video) {
      const currentBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock() as EditableVideosContentBlock;
      placeholder = intl.get('new assignment.videos_selected');

      if (currentBlock && currentBlock.videos && currentBlock.videos.length) {
        return `${currentBlock.videos.length} ${placeholder}`;
      }
    }
    return `0 ${placeholder}`;
  }

  public renderPlaceholder = () => {
    if (this.context.contentType === AttachmentContentType.image) {
      return intl.get('new assignment.search_for_images');
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      return intl.get('new assignment.search_for_images');
    }
    if (this.context.contentType === AttachmentContentType.video) {
      return intl.get('new assignment.search_for_videos');
    }
  }

  public renderAttachmentTab = () => {
    const { newAssignmentStore } = this.props;
    const userType = newAssignmentStore!.getCurrentUser()!.type;
    if (userType === UserType.ContentManager) {
      if (this.context.contentType === AttachmentContentType.image) {
        return (
          <div>
            <span onClick={() => { this.setState({ selectedTabId: 1 }); }} className="image_Option">{intl.get('new assignment.images_options.images_from_article')}</span>
            <span onClick={() => { this.setState({ selectedTabId: 2 }); this.props.context.changeContentType(AttachmentContentType.customImage); }} className="image_Option">{intl.get('new assignment.images_options.custom_images')}</span>
            <span onClick={() => { this.setState({ selectedTabId: 3 }); }} className="image_Option">{intl.get('new assignment.images_options.upload_image')}</span>
          </div>
        );
      }
      if (this.context.contentType === AttachmentContentType.customImage) {
        return (
          <div>
            <span onClick={() => { this.setState({ selectedTabId: 1 }); this.props.context.changeContentType(AttachmentContentType.image); }} className="image_Option">{intl.get('new assignment.images_options.images_from_article')}</span>
            <span onClick={() => { this.setState({ selectedTabId: 2 }); }} className="image_Option">{intl.get('new assignment.images_options.custom_images')}</span>
            <span onClick={() => { this.setState({ selectedTabId: 3 }); }} className="image_Option">{intl.get('new assignment.images_options.upload_image')}</span>
          </div>
        );
      }
      if (this.context.contentType === AttachmentContentType.video) {
        return <span>{intl.get('new assignment.videos_from_article')}</span>;
      }
    } else {
      if (this.context.contentType === AttachmentContentType.image) {
        return (
          <div>
            <span onClick={() => { this.setState({ selectedTabId: 1 }); }} className="image_Option">{intl.get('new assignment.images_options.images_from_article')}</span>
          </div>
        );
      }
      if (this.context.contentType === AttachmentContentType.customImage) {
        return (
          <div>
            <span onClick={() => { this.setState({ selectedTabId: 1 }); this.props.context.changeContentType(AttachmentContentType.image); }} className="image_Option">{intl.get('new assignment.images_options.images_from_article')}</span>
          </div>
        );
      }
      if (this.context.contentType === AttachmentContentType.video) {
        return <span>{intl.get('new assignment.videos_from_article')}</span>;
      }
    }

  }

  public renderAttachmentsStockTab = () => {
    if (this.context.contentType === AttachmentContentType.image) {
      return <span>{intl.get('new assignment.stock_images')}</span>;
    }
    if (this.context.contentType === AttachmentContentType.video) {
      return <span>{intl.get('new assignment.stock_videos')}</span>;
    }
  }

  public calcCounterAttachments = () => {
    const { newAssignmentStore } = this.props;
    const editableBlock = newAssignmentStore!.getAttachmentsFromCurrentBlock();

    if (editableBlock && editableBlock.type) {
      switch (editableBlock.type) {
        case ContentBlockType.Images: {
          const block = editableBlock as EditableImagesContentBlock;
          return block.images.length;
        }
        case ContentBlockType.CustomImages: {
          const block = editableBlock as EditableImagesContentBlock;
          return block.images.length;
        }
        case ContentBlockType.Videos: {
          const block = editableBlock as EditableVideosContentBlock;
          return block.videos.length;
        }
        default: return 0;
      }
    }
    return 0;
  }

  public calcDisabledAttachmentButton = () => {
    const { newAssignmentStore } = this.props;
    const currentQuestion = newAssignmentStore!.currentQuestion;

    if (currentQuestion && currentQuestion.type === QuestionType.ImageChoice && newAssignmentStore!.getCurrentOption >= 0) {
      const question = currentQuestion as EditableImageChoiceQuestion;
      const optionImage = question.options[newAssignmentStore!.getCurrentOption];
      return !(optionImage && optionImage.image);
    }
    const counterAttachment = this.calcCounterAttachments();
    return counterAttachment === 0;
  }

  public renderSelectedImageChoiceAttachment = () => {
    const counterAttachment = this.calcCounterAttachments();
    if (counterAttachment > 0) {
      return intl.get('new assignment.image_selected');
    }
    return intl.get('new assignment.image_not_selected');
  }

  public renderAttachments = () => {
    if (this.context.contentType === AttachmentContentType.image) {
      return (
        <ImageAttachments
          filterAttachments={this.filterAttachments}
          renderAttachment={this.renderAttachment}
          sortAttachments={this.sortAttachments}
        />
      );
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      return (
        <CustomImageAttachments
          filterAttachments={this.filterAttachments}
          renderAttachment={this.renderAttachment}
          sortAttachments={this.sortAttachments}
        />
      );
    }
    if (this.context.contentType === AttachmentContentType.video) {
      return (
        <VideosAttachments
          filterAttachments={this.filterAttachments}
          renderAttachment={this.renderAttachment}
          sortAttachments={this.sortAttachments}
        />
      );
    }
  }

  public renderCustomImages = () => {
    if (this.context.contentType === AttachmentContentType.customImage) {
      return (
        <CustomImageAttachments
          filterAttachments={this.filterAttachments}
          renderAttachment={this.renderAttachment}
          sortAttachments={this.sortAttachments}
        />
      );
    }
  }

  public renderUploadImageForm = () => {
    if (true) {
      return (
        <CustomImageForm />
      );
    }
  }

  public renderTabByOption = () => {
    const { selectedTabId } = this.state;
    switch (selectedTabId!) {
      case 1:
        return this.renderAttachments();
        break;
      case this.TWO:
        return this.renderCustomImages();
        break;
      case this.THREE:
        return this.renderUploadImageForm();
        break;
      default:
        return this.renderAttachments();
        break;
    }
  }

  public renderBottomInfoAndAddBar = () => {
    const { newAssignmentStore } = this.props;
    const isMultipleChoice = newAssignmentStore!.isMultipleChoice();
    const onThirdTab = this.state.selectedTabId === this.THREE;

    if (!onThirdTab) {
      return (
        <div className="attachment-info">
          <div className="images-count">
            {isMultipleChoice ? this.renderSelectedImageChoiceAttachment() : this.renderSelectedAttachmentsCount()}
          </div>
          <CreateButton onClick={this.closeAttachmentsList} disabled={this.calcDisabledAttachmentButton()} title={isMultipleChoice ? intl.get('new assignment.use_this_image') : intl.get('new assignment.add_to_assignment')}>
            {isMultipleChoice ? intl.get('new assignment.use_this_image') : intl.get('new assignment.add_to_assignment')}
          </CreateButton>
        </div>
      );
    }
  }

  public render() {

    const { newAssignmentStore } = this.props;
    const isLoading = newAssignmentStore!.fetchingAttachments || newAssignmentStore!.fetchingAttachments || false;

    return (
      <div className="attachments-list-container">
        <div className="attachments-tabs">
          <div className={'wrapper-tabs'}>
            <div className="attachments-tab imgs-from-article">
              {this.renderAttachmentTab()}
            </div>

            <div className="attachments-tab stock-imgs disabled">
              {/*{this.renderAttachmentsStockTab()}*/}
            </div>
          </div>
          <button onClick={this.closeAttachmentsList} ref={this.refButton} title="Close">
            <img src={closeCross} alt="Close" title="Close" />
          </button>
        </div>

        <div className="contentWrapper">
          {this.renderSearchBar()}

          {isLoading && this.renderSkeletonLoader()}
          {!isLoading && this.renderTabByOption()}
        </div>

        {this.renderBottomInfoAndAddBar()}

      </div>
    );
  }
}

// TS issue
// tslint:disable-next-line:no-any
export const AttachmentsList = withRouter(AttachmentsListComponent as React.ComponentType<any>);
