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
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;

interface Props {
  currentEntity: DraftAssignment | DraftTeachingPath;
  showValidationErrors: boolean;
  localeKey: string;
}

@observer
export class PublishingTitle extends Component<Props> {
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  private focusDescriptionField = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.keyCode === ENTER_KEY_CODE) {
      this.descriptionRef.current!.selectionStart = this.descriptionRef.current!.selectionEnd = this.descriptionRef.current!.value.length;
      this.descriptionRef.current!.focus();
    }
    const isDoubleQuote = (e.shiftKey && e.keyCode === ENTER_DOUBLE_QUOTE_CODE) ? true : false;
    if (isDoubleQuote || e.keyCode === ENTER_SINGLE_QUOTE_CODE) {
      setTimeout(
        () => {
          this.titleRef.current!.selectionEnd = Number(this.titleRef.current!.value!.length) - 1;
          this.titleRef.current!.focus();
        },
        DELAY
      );
    }
  }

  private focusTextField  = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const isDoubleQuote = (e.shiftKey && e.keyCode === ENTER_DOUBLE_QUOTE_CODE) ? true : false;
    if (isDoubleQuote || e.keyCode === ENTER_SINGLE_QUOTE_CODE) {
      setTimeout(
        () => {
          this.descriptionRef.current!.selectionEnd = Number(this.descriptionRef.current!.value!.length) - 1;
          this.descriptionRef.current!.focus();
        },
        DELAY
      );
    }
  }

  public useValuedQuotes = (value: string) => {
    const startQuote = '«';
    const endQuote = '»';
    let newvalue = value;
    if (value.split("'").length > 1 || value.split('"').length > 1) {
      const initValue = (value.split("'").length > 1) ? value.split("'")[0] : value.split('"')[0];
      newvalue = `${initValue}${startQuote}${endQuote}`;
    }
    return newvalue;
  }

  public setTeachingPathTitle = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const { currentEntity } = this.props;
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
    if (lettersNoEn(value)) {
      currentEntity!.setTitle(value);
    }
  }

  public setTeachingPathDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const { currentEntity } = this.props;
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
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
            onKeyUp={this.focusDescriptionField}
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
            onKeyUp={this.focusTextField}
            inputRef={this.descriptionRef}
            maxLength={MAX_DESCRIPTION_LENGTH}
            aria-labelledby="DescriptionInputTextArea"
          />
        </div>
      </div>
    );
  }
}
