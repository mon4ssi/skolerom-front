import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import activeIcon from 'assets/images/check-active.svg';
import play from 'assets/images/play.svg';
import clock from 'assets/images/clock-dark.svg';

import { FilterableAttachment } from './AttachmentsList';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import { mxSingleNumber } from '../../../../components/common/QuestionPreview/QuestionPreview';

import './AttachmentsList.scss';

export const fullMinute = 60;

interface IProps {
  attachment: FilterableAttachment;
  onSelect: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  isSelected?: boolean;
}

interface AttachmentComponentState {
  isProcessing: boolean;
}

@observer
export class AttachmentComponent extends Component<IProps, AttachmentComponentState> {
  public static contextType = AttachmentContentTypeContext;

  public state = {
    isProcessing: false,
  };

  private toggleAttachment = async () => {
    const { isSelected, attachment } = this.props;
    const { isProcessing } = this.state;
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

  public renderAttachments = () => {
    const { attachment } = this.props;

    if (this.context.contentType === AttachmentContentType.image) {
      return (
        <button title="Attachment Media">
          <img
            src={attachment.path}
            alt={attachment.alt}
            srcSet={attachment.src && attachment.src[1] && attachment.src[1]}
            sizes={'(min-width: 320px) 300px'}
          />
        </button>
      );
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      return (
        <button title="Attachment Media">
          <img
            src={attachment.path}
            alt={attachment.alt}
            srcSet={attachment.path}
            sizes={'(min-width: 320px) 300px'}
          />
        </button>
      );
    }
    if (this.context.contentType === AttachmentContentType.video) {
      return (
        <button title="Attachment Media">
          <div className={'playButton'}>
            <img src={play} alt="play"/>
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
          <img src={clock} alt="clock" className={'clockDuration'}/>
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
      <div className={wrapClass} onClick={this.toggleAttachment}>
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
      style={{ maxHeight: 40, maxWidth: 40 }}
    />
  </div>
);
