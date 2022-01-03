import React, { Component } from 'react';
import intl from 'react-intl-universal';
import TextAreaAutosize from 'react-textarea-autosize';
import { inject, observer } from 'mobx-react';

import { EditTeachingPathStore } from '../EditTeachingPathStore';

import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH_500 } from 'utils/constants';

import './TeachingPathTitle.scss';

const ENTER_KEY_CODE = 13;
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  readOnly?: boolean;
}

@inject('editTeachingPathStore')
@observer
export class TeachingPathTitle extends Component<Props> {

  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  private focusDescriptionField = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const startQuote = '«»';
    if (e.keyCode === ENTER_KEY_CODE) {
      e.preventDefault();
      this.descriptionRef.current!.selectionStart = this.descriptionRef.current!.selectionEnd - this.descriptionRef.current!.value!.length;
      this.descriptionRef.current!.focus();
    }
    const isDoubleQuote = (e.shiftKey && e.keyCode === ENTER_DOUBLE_QUOTE_CODE) ? true : false;
    if (isDoubleQuote || e.keyCode === ENTER_SINGLE_QUOTE_CODE) {
      setTimeout(
        () => {
          this.titleRef.current!.selectionEnd = Number(this.titleRef.current!.value!.split(startQuote)[0].length) + 1;
          this.titleRef.current!.focus();
        },
        DELAY
      );
    }
  }

  private focusTextField  = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const startQuote = '«»';
    const isDoubleQuote = (e.shiftKey && e.keyCode === ENTER_DOUBLE_QUOTE_CODE) ? true : false;
    if (isDoubleQuote || e.keyCode === ENTER_SINGLE_QUOTE_CODE) {
      setTimeout(
        () => {
          this.descriptionRef.current!.selectionEnd = Number(this.descriptionRef.current!.value!.split(startQuote)[0].length) + 1;
          this.descriptionRef.current!.focus();
        },
        DELAY
      );
    }
  }

  public componentDidMount() {
    this.titleRef.current!.focus();
    this.titleRef.current!.selectionStart = this.titleRef.current!.selectionEnd - this.titleRef.current!.value!.length;
  }

  public useValuedQuotes = (value: string) => {
    const startQuote = '«';
    const endQuote = '»';
    let newvalue = value;
    if (value.split("'").length > 1 || value.split('"').length > 1) {
      const initValue = (value.split("'").length > 1) ? value.split("'")[0] : value.split('"')[0];
      const secondValue = (value.split("'").length > 1) ? value.split("'")[1] : value.split('"')[1];
      newvalue = `${initValue}${startQuote}${endQuote}${secondValue}`;
    }
    return newvalue;
  }

  public setTitle = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;
    event.preventDefault();
    const value = this.useValuedQuotes(event.currentTarget.value);
    if (lettersNoEn(value)) {
      currentTeachingPath!.setTitle(value);
    }
  }

  public setDescription = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;
    event.preventDefault();
    const value = this.useValuedQuotes(event.currentTarget.value);
    if (lettersNoEn(value)) {
      currentTeachingPath!.setDescription(value);
    }
  }

  public renderDescription = () => {
    const { readOnly } = this.props;
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;

    if (readOnly && !currentTeachingPath!.description) return null;
    return (
      <TextAreaAutosize
        inputRef={this.descriptionRef}
        className="descriptionInput"
        placeholder={intl.get('edit_teaching_path.title.description_placeholder')}
        value={currentTeachingPath!.description}
        onChange={this.setDescription}
        onKeyUp={this.focusTextField}
        maxLength={MAX_DESCRIPTION_LENGTH_500}
        readOnly={readOnly}
        aria-labelledby="DescriptionInputTextArea"
      />
    );
  }

  public render() {
    const { readOnly } = this.props;
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;

    return (
      <div className="TeachingPathTitle flexBox justifyCenter">
        <div className="titleWrapper flexBox dirColumn">
          {!readOnly && <span>{intl.get('edit_teaching_path.title.new_entity')}</span>}
          <label id="titleInputTextArea" className="hidden">{intl.get('edit_teaching_path.title.title_placeholder')}</label>
          <TextAreaAutosize
            inputRef={this.titleRef}
            className="titleInput fw500"
            value={currentTeachingPath!.title}
            onChange={this.setTitle}
            placeholder={intl.get('edit_teaching_path.title.title_placeholder')}
            onKeyUp={this.focusDescriptionField}
            maxLength={MAX_TITLE_LENGTH}
            readOnly={readOnly}
            aria-labelledby="titleInputTextArea"
          />
          <label id="DescriptionInputTextArea" className="hidden">{intl.get('edit_teaching_path.title.description_placeholder')}</label>
          {this.renderDescription()}
          <div className="horizontalLine" />
        </div>
      </div>
    );
  }
}
