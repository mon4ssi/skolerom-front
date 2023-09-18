import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { observer } from 'mobx-react';
import TextAreaAutosize from 'react-textarea-autosize';

import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH_500 } from 'utils/constants';

import './PublishingTitle.scss';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { DraftTeachingPath } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

interface Props {
  currentEntity: DraftAssignment | DraftTeachingPath;
  showValidationErrors: boolean;
  localeKey: string;
}

@observer
export class PublishingTitle extends Component<Props> {
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  public setTeachingPathTitle = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const { currentEntity } = this.props;
    e.preventDefault();
    const value = e.currentTarget.value;
    if (lettersNoEn(value)) {
      currentEntity!.setTitle(value);
    }
  }

  public setTeachingPathDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const { currentEntity } = this.props;
    e.preventDefault();
    const value = e.currentTarget.value;
    if (lettersNoEn(value)) {
      currentEntity!.setDescription(value);
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
          <label id="titleInputTextArea" className="hidden">{intl.get('edit_teaching_path.title.title_placeholder')}</label>
          <TextAreaAutosize
            autoFocus
            id={'textAreaAutosize'}
            className="entityTitleInput"
            value={currentEntity!.title}
            onChange={this.setTeachingPathTitle}
            placeholder={intl.get(`${localeKey}.title.title_placeholder`)}
            maxLength={MAX_TITLE_LENGTH}
            inputRef={this.titleRef}
            aria-labelledby="titleInputTextArea"
          />
          <label id="DescriptionInputTextArea" className="hidden">{intl.get('edit_teaching_path.title.description_placeholder')}</label>
          <TextAreaAutosize
            className="entityDescriptionInput fw300"
            placeholder={intl.get(`${localeKey}.title.description_placeholder`)}
            value={currentEntity!.description}
            onChange={this.setTeachingPathDescription}
            inputRef={this.descriptionRef}
            maxLength={MAX_DESCRIPTION_LENGTH_500}
            aria-labelledby="DescriptionInputTextArea"
          />
        </div>
      </div>
    );
  }
}
