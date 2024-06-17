import React, { Component } from 'react';
import intl from 'react-intl-universal';
import TextAreaAutosize from 'react-textarea-autosize';
import { inject, observer } from 'mobx-react';
import { EditTeachingPathStore } from '../EditTeachingPathStore';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH_500 } from 'utils/constants';
import './TeachingPathTitle.scss';

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  readOnly?: boolean;
}

@inject('editTeachingPathStore')
@observer
export class TeachingPathTitle extends Component<Props> {

  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  public componentDidMount() {
    this.titleRef.current!.focus();
    this.titleRef.current!.selectionStart = this.titleRef.current!.selectionEnd - this.titleRef.current!.value!.length;
  }

  public setTitle = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;
    event.preventDefault();
    const value = event.currentTarget.value;
    currentTeachingPath!.setTitle(value);
    /* if (lettersNoEn(value)) {
      currentTeachingPath!.setTitle(value);
    } */
  }

  public setDescription = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;
    event.preventDefault();
    const value = event.currentTarget.value;
    currentTeachingPath!.setDescription(value);
    /* if (lettersNoEn(value)) {
      currentTeachingPath!.setDescription(value);
    } */
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
        maxLength={MAX_DESCRIPTION_LENGTH_500}
        readOnly={readOnly}
        aria-labelledby="DescriptionInputTextArea"
      />
    );
  }

  public openModalTeacherguidance = () => {
    const { currentEntity: currentTeachingPath } = this.props.editTeachingPathStore!;
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
            maxLength={MAX_TITLE_LENGTH}
            readOnly={readOnly}
            aria-labelledby="titleInputTextArea"
          />
          <label id="DescriptionInputTextArea" className="hidden">{intl.get('edit_teaching_path.title.description_placeholder')}</label>
          {this.renderDescription()}
        </div>
      </div>
    );
  }
}
