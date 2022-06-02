import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';

import activeIcon from 'assets/images/check-active.svg';
import play from 'assets/images/play.svg';
import clock from 'assets/images/clock-dark.svg';
import settingsIcon from 'assets/images/more-with-bg.svg';
import duplicateIcon from 'assets/images/duplicate-question.svg';
import deleteIcon from 'assets/images/delete-question.svg';

import { FilterableAttachment } from './AttachmentsList';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import { mxSingleNumber } from '../../../../components/common/QuestionPreview/QuestionPreview';

import './AttachmentsList.scss';
import { ArticleService } from 'assignment/service';
import { injector } from 'Injector';
import { ARTICLE_SERVICE_KEY } from 'assignment/Assignment';
import { isThisHour } from 'date-fns';
import { MoreOptionsCustomImage } from './Attachments/MoreOptionsCustomImage/MoreOptionsCustomImage';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

export const fullMinute = 60;

interface IProps {
  attachment: FilterableAttachment;
  onSelect: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onEditActionSelected: (id: number) => Promise<void>;
  onRenderThirdTab: (id: number) => Promise<void>;
  onRedirectToList: () => Promise<void>;
  isSelected?: boolean;
}

interface AttachmentComponentState {
  isProcessing: boolean;
  showMoreOptions: boolean;
  waitingForOption: boolean;
}

@observer
export class AttachmentComponent extends Component<IProps, AttachmentComponentState> {
  public static contextType = AttachmentContentTypeContext;
  public articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  public state = {
    isProcessing: false,
    showMoreOptions: false,
    waitingForOption: false,
  };

  private toggleAttachment = async () => {
    const { isSelected, attachment } = this.props;
    const { isProcessing, showMoreOptions, waitingForOption } = this.state;
    if (isProcessing) { return; }

    this.setState({ isProcessing: true });

    try {
      if (!isSelected) {
        await this.props.onSelect(attachment.id);
      } else {
        await this.props.onRemove(attachment.id);
      }

    } catch (e) {
      console.error(e.message);
    } finally {
      this.setState({ isProcessing: false });
    }
  }

  private removeItem = async () => {
    const { attachment } = this.props;
    this.toggleAttachment();
    await this.articleService.deleteCustomImage(attachment.id);
    Notification.create({
      type: NotificationTypes.SUCCESS,
      title: 'Image removed succesfully',
    });
    this.props.onRedirectToList();
  }

  private editItem = async () => {
    const { attachment } = this.props;
    this.toggleAttachment();
    await this.props.onEditActionSelected(attachment.id);
    /* await this.props.onRenderThirdTab(attachment!.id); */
  }

  private sendEdition = async (customImageId: number, formData: FormData) => {
    await this.articleService.updateCustomImage(customImageId, formData);
  }

  private renderThirdTab = async () => {
    const { attachment } = this.props;
    await this.props.onRenderThirdTab(attachment.id);
  }

  public toggleMoreOptions = () => {
    const { showMoreOptions } = this.state;
    if (!showMoreOptions) {
      this.setState({ showMoreOptions: true });
    } else {
      this.setState({ showMoreOptions: false });
    }
  }

  public renderTitleInfo = (title: string | undefined, src: string) => {
    const { attachment, isSelected } = this.props;
    return (
      <div className="customImageComponente__content" >
        <div className="customImageComponente__content__item"><strong>{intl.get('assignments_page.title')}:</strong> {title}</div>
        <div className="customImageComponente__content__item"><strong>{intl.get('assignments_page.source')}:</strong> {src}</div>
      </div>
    );
  }

  public renderAttachments = () => {
    const { attachment, isSelected } = this.props;
    const { isProcessing, showMoreOptions } = this.state;

    if (this.context.contentType === AttachmentContentType.image) {
      let arraySrc = attachment.src && attachment.src[1] && attachment.src[1];
      if (!Array.isArray(attachment.src)) {
        arraySrc = attachment.path;
      }
      return (
        <button title="Attachment Media" onClick={this.toggleAttachment}>
          <img
            src={attachment.path}
            alt={attachment.alt}
            srcSet={arraySrc}
            sizes={'(min-width: 320px) 300px'}
          />
        </button>
      );
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      const selectedItem = isSelected ? 'customImageComponente active' : 'customImageComponente';
      const isCustomImg = (attachment.path!.split(String(process.env.REACT_APP_WP_URL)).length > 1) ? false : true;
      const isCustomImgClass = (isCustomImg) ? 'customImageComponente__image' : 'customImageComponente__image heightfull';
      return (
        <div className={selectedItem}>
          <div className={isCustomImgClass}>
            <button title={attachment.title} className="customImageComponente__image__button" onClick={this.toggleAttachment}>
              <img
                src={attachment.path}
                alt={attachment.alt}
                srcSet={attachment.path}
              />
            </button>
            {isCustomImg && <MoreOptionsCustomImage attachmentId={0} onEdit={this.editItem} onRemove={this.removeItem} />}
          </div>
          {isCustomImg && this.renderTitleInfo(attachment.title, String(attachment.src))}
        </div>
      );
    }
    if (this.context.contentType === AttachmentContentType.video) {
      return (
        <button title="Attachment Media">
          <div className={'playButton'}>
            <img src={play} alt="play" />
          </div>
          <video width="100%" height="100%" style={{ objectFit: 'cover' }}>
            <source src={attachment.path} type="video/mp4" />
          </video>
        </button>
      );
    }
  }

  public renderDurationAndTitle = () => {
    const { attachment } = this.props;
    const minutes = Math.trunc(attachment.duration! / fullMinute);
    const seconds = attachment.duration! % fullMinute;
    const sec = seconds < mxSingleNumber ? '0'.concat(seconds.toString()) : seconds;

    return (
      <div className={'videoDuration'}>
        <div className={'flexBox alignCenter'}>
          <span className={'fs15 fw500'}>{attachment.title}</span>
        </div>

        <div className={'flexBox duration'}>
          <img src={clock} alt="clock" className={'clockDuration'} />
          <span className={'fs15 fw300'}>{minutes}:{sec}</span>
        </div>
      </div>
    );
  }

  public render() {
    const { isProcessing } = this.state;
    const { isSelected, attachment } = this.props;
    let wrapClass;
    if (this.context.contentType === AttachmentContentType.image) {
      wrapClass = classnames('attachments-list__img-wrap', {
        disabled: isProcessing,
        selected: isSelected,
      });
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      wrapClass = classnames('attachments-list__img-wrap', {
        disabled: isProcessing,
        selected: isSelected,
      });
    }
    if (this.context.contentType === AttachmentContentType.video) {
      wrapClass = classnames('attachments-list__video-wrap', {
        disabled: isProcessing,
        selected: isSelected,
      });

      return (
        <div className={'videoWrapper'}>
          <div className={wrapClass} onClick={this.toggleAttachment}>
            {isSelected && (<ActiveIcon />)}
            {this.renderAttachments()}
          </div>
          {attachment.duration && this.renderDurationAndTitle()}
        </div>
      );
    }

    return (
      <div className={wrapClass}>
        {isSelected && (<ActiveIcon />)}
        {this.renderAttachments()}
      </div>
    );
  }
}
const ActiveIcon = () => (
  <div className="is-selected-icon">
    <img
      src={activeIcon}
      alt="active"
      style={{ maxHeight: 40, maxWidth: 40, position: 'relative', zIndex: 4, top: '30%' }}
    />
  </div>
);
