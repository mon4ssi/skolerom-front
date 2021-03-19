import React, { Component, SyntheticEvent } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';

import textExtraIcon from 'assets/images/text-extra.svg';
// import temabokExtraIcon from 'assets/images/temabok-extra.svg';
import sideExtraIcon from 'assets/images/side-extra.svg';
import videoExtraIcon from 'assets/images/video-extra.svg';
// import audioExtraIcon from 'assets/images/audio-extra.svg';

import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { ContentBlockType } from '../../../ContentBlock';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';

import './Questions.scss';
import './QuestionContentPanel.scss';

// import audioExtraIconActive from 'assets/images/audio-extra-active.svg';

interface ContentButtonProps {
  text: string;
  icon: string;
  onClick: (e: SyntheticEvent) => void;
}

class ContentButton extends Component<ContentButtonProps> {
  private onClick = (e: SyntheticEvent) => {
    this.props.onClick(e);
  }

  public render() {
    const { text, icon } = this.props;
    const alt = `Extra ${text.toLowerCase()}`;

    return (
      <button
        className={'extra-button alignCenter'}
        type="button"
        name={text.toLowerCase()}
        onClick={this.onClick}
      >
        <img src={icon} alt={alt} />
        <span className={'fw500 fs13'}>{text}</span>
      </button>
    );
  }
}

interface QuestionContentPanelProps {
  question: EditableQuestion;
  addNewContentBlock: (type: ContentBlockType) => void;
}

@observer
export class QuestionContentPanel extends Component<QuestionContentPanelProps> {
  public static contextType = AttachmentContentTypeContext;

  private addContentBlock = (type: ContentBlockType) => (e: SyntheticEvent) => {
    e.stopPropagation();

    switch (type) {
      case ContentBlockType.Text:
        this.context.changeContentType(AttachmentContentType.text);
        break;
      case ContentBlockType.Images:
        this.context.changeContentType(AttachmentContentType.image);
        break;
      case ContentBlockType.Videos:
        this.context.changeContentType(AttachmentContentType.video);
        break;
      default:
        throw new TypeError(`Unimplemented content block type: ${type}`);
    }
    this.props.addNewContentBlock(type);
  }

  public render() {
    return (
      <div className="extra flexBox">
        <ContentButton
          text={intl.get('new assignment.text')}
          icon={textExtraIcon}
          onClick={this.addContentBlock(ContentBlockType.Text)}
        />

        <ContentButton
          text={intl.get('new assignment.image')}
          icon={sideExtraIcon}
          onClick={this.addContentBlock(ContentBlockType.Images)}
        />

        <ContentButton
          text={intl.get('new assignment.video')}
          icon={videoExtraIcon}
          onClick={this.addContentBlock(ContentBlockType.Videos)}
        />

      </div>
    );
  }
}

/* <ContentButton
  value={AttachmentContentType.magazine}
  text={intl.get('new assignment.magazine')}
  isSelected={isSelectedMagazine}
  icon={magazineIcon}
  onClick={this.changeContentTypeOrCurrentQuestion}
/>*/

/*<ContentButton
  value={AttachmentContentType.sound}
  text={intl.get('new assignment.sound')}
  isSelected={isSelectedSound}
  icon={soundIcon}
  onClick={this.changeContentTypeOrCurrentQuestion}
/>*/
