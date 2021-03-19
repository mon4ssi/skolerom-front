import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { observer } from 'mobx-react';
import TextAreaAutosize from 'react-textarea-autosize';

import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from 'utils/constants';

import './PublishingTitle.scss';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { DraftTeachingPath } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

const ENTER_KEY_CODE = 13;

interface Props {
  currentEntity: DraftAssignment | DraftTeachingPath;
  showValidationErrors: boolean;
  localeKey: string;
}

@observer
export class PublishingTitle extends Component<Props> {
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  private focusDescriptionField = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.keyCode === ENTER_KEY_CODE) {
      this.descriptionRef.current!.selectionStart = this.descriptionRef.current!.selectionEnd = this.descriptionRef.current!.value.length;
      this.descriptionRef.current!.focus();
    }
  }

  private setTeachingPathTitle = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const { currentEntity } = this.props;

    if (lettersNoEn(e.target.value)) {
      currentEntity!.setTitle(e.target.value);
    }
  }

  private setTeachingPathDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const { currentEntity } = this.props;
    if (lettersNoEn(e.target.value)) {
      currentEntity!.setDescription(e.target.value);
    }
  }

  public componentDidMount() {
    const input: HTMLTextAreaElement = document.getElementById('textAreaAutosize') as HTMLTextAreaElement;
    input!.focus();
    input!.setSelectionRange(this.props.currentEntity.title.length, this.props.currentEntity.title.length);
  }

  public render() {
    const { currentEntity, localeKey } = this.props;

    return (
      <div className="PublishingTitle">
        <div className="entityTitleWrapper flexBox dirColumn">
          <span className="fw500">
            {intl.get(`${localeKey}.title.new_entity`)}
          </span>
          <TextAreaAutosize
            autoFocus
            id={'textAreaAutosize'}
            className="entityTitleInput"
            value={currentEntity!.title}
            onChange={this.setTeachingPathTitle}
            placeholder={intl.get(`${localeKey}.title.title_placeholder`)}
            onKeyUp={this.focusDescriptionField}
            maxLength={MAX_TITLE_LENGTH}
          />
          <TextAreaAutosize
            className="entityDescriptionInput fw300"
            placeholder={intl.get(`${localeKey}.title.description_placeholder`)}
            value={currentEntity!.description}
            onChange={this.setTeachingPathDescription}
            inputRef={this.descriptionRef}
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
        </div>
      </div>
    );
  }
}
