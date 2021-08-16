import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import TextAreaAutosize from 'react-textarea-autosize';

import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH_500 } from 'utils/constants';

import './AssignmentTitle.scss';

const ENTER_KEY_CODE = 13;

interface Props {
  assignment: DraftAssignment;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
export class AssignmentTitle extends Component<Props> {
  private descriptionField: HTMLTextAreaElement | null = null;
  private titleField: HTMLTextAreaElement | null = null;

  private focusDescriptionField = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.keyCode === ENTER_KEY_CODE) {
      this.descriptionField!.selectionStart = this.descriptionField!.selectionEnd = this.descriptionField!.value.length;
      this.descriptionField!.focus();
    }
  }

  private setAssignmentTitle = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (e.target.value === '' || lettersNoEn(e.target.value)) {
      this.props.assignment.setTitle(e.target.value);
    }
  }

  private setAssignmentDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (e.target.value === '' || lettersNoEn(e.target.value)) {
      this.props.assignment.setDescription(e.target.value);
    }
  }

  private setDescriptionRef = (node: HTMLTextAreaElement) => {
    this.descriptionField = node;
  }

  private setTitleRef = (node: HTMLTextAreaElement) => {
    this.titleField = node;
  }

  private setHighlightedItem = () => {
    this.props.newAssignmentStore!.setHighlightingItem(CreationElements.Title);
  }

  public componentDidMount() {
    this.titleField!.focus();
    this.titleField!.setSelectionRange(this.props.assignment.title.length, this.props.assignment.title.length);
  }

  public render() {
    const { assignment, newAssignmentStore } = this.props;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Title) ? 'lightItem' : '';

    return (
      <div className={`AssignmentTitle ${lightItem}`} onClick={this.setHighlightedItem}>
        <div className="assignmentTitleWrapper flexBox dirColumn">
          <span className="fw500">
            {intl.get('assignments_tabs.new_assignment')}
          </span>
          <label id="titleInputTextArea" className="hidden">{intl.get('new assignment.title.title_placeholder')}</label>
          <TextAreaAutosize
            autoFocus
            value={assignment!.title}
            className={`newAssignmentTitleInput ${lightItem}`}
            onChange={this.setAssignmentTitle}
            placeholder={intl.get('new assignment.title.title_placeholder')}
            onKeyUp={this.focusDescriptionField}
            inputRef={this.setTitleRef}
            maxLength={MAX_TITLE_LENGTH}
            aria-labelledby="titleInputTextArea"
          />
          <label id="DescriptionInputTextArea" className="hidden">{intl.get('new assignment.title.description_placeholder')}</label>
          <TextAreaAutosize
            className={`newAssignmentDescriptionInput fw300 ${lightItem}`}
            placeholder={intl.get('new assignment.title.description_placeholder')}
            value={assignment.description}
            onChange={this.setAssignmentDescription}
            inputRef={this.setDescriptionRef}
            maxLength={MAX_DESCRIPTION_LENGTH_500}
            aria-labelledby="DescriptionInputTextArea"
          />
        </div>
      </div>
    );
  }
}
