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

export const fullMinute = 60;

interface IProps {
  attachment: FilterableAttachment;
  onSelect: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onEditActionSelected: (id: number) => Promise<void>;
  onRenderThirdTab: (id: number) => Promise<void>;
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
      /* console.log(showMoreOptions!);
      console.log(waitingForOption!); */
      if (!(showMoreOptions && !waitingForOption)) {
        if (!isSelected) {
          await this.props.onSelect(attachment.id);
        } else {
          await this.props.onRemove(attachment.id);
        }
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      this.setState({ isProcessing: false });
    }
  }

  private removeItem = async () => {
    const { attachment } = this.props;
    await this.articleService.deleteCustomImage(attachment.id);
    await this.articleService.fetchCustomImages()!;
  }

  private editItem = async () => {
    const { attachment } = this.props;
    await this.props.onEditActionSelected(attachment.id);
    await this.props.onRenderThirdTab(attachment!.id);
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

  public renderAttachments = () => {
    const { attachment, isSelected } = this.props;
    const { isProcessing, showMoreOptions } = this.state;

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
      const selectedItem = isSelected ? 'customImageComponente active' : 'customImageComponente';
      return (
        <div className={selectedItem}>
          <div className="customImageComponente__image">
            <button title={attachment.title} className="customImageComponente__image__button" onClick={this.toggleAttachment}>
              <img
                src={attachment.path}
                alt={attachment.alt}
                srcSet={attachment.path}
              />
            </button>
            <div className="MoreOptions">
              <button onClick={() => { this.toggleMoreOptions(); this.setState({ waitingForOption: true }); }}>
                <img
                  src={settingsIcon}
                  alt="active"
                  className={'moreIcon'}
                />
              </button>
              {showMoreOptions && this.renderMoreOptions()}
            </div>
          </div>
          <div className="customImageComponente__content" onClick={this.toggleAttachment}>
            <div className="customImageComponente__content__item"><strong>{intl.get('assignments_page.title')}:</strong> {attachment.title}</div>
            <div className="customImageComponente__content__item"><strong>{intl.get('assignments_page.source')}:</strong> {attachment.src}</div>
          </div>
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

  public renderMoreOptions = () => {
    const { attachment, isSelected } = this.props;
    return (
      <div className="tooltip">
        <div className="bottom">
          <ul className="flexBox dirColumn">
            <li>
              <a href="javascript:void(0)" onClick={() => { this.editItem(); this.setState({ showMoreOptions: false }); this.setState({ waitingForOption: true }); }} className="flexBox" >
                <span>Edit </span>
                <img src={duplicateIcon} alt="Edit custom image" />
              </a>
            </li>
            <li>
              <a href="javascript:void(0)" onClick={() => { /* console.log(`delete: ${attachment.id}`); */ this.removeItem(); this.setState({ showMoreOptions: false }); this.setState({ waitingForOption: true }); }} className="flexBox">
                <span style={{ color: '#E2017B' }}>Remove </span>
                <img src={deleteIcon} alt="Delete custom image" />
              </a>
            </li>
          </ul>

          {/* <i /> */}
        </div>
      </div>
    );
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

const SettingsIcon = () => (
  <div>
    <img src={settingsIcon} alt="Settings" style={{ maxHeight: 40, maxWidth: 40, position: 'relative', zIndex: 200 }} />
  </div>
);
