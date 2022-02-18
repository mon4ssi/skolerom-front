import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import TextAreaAutosize from 'react-textarea-autosize';

import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH_500, MAX_TITLE_LENGTH } from 'utils/constants';

import './AssignmentTitle.scss';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import teaGuiBGImg from 'assets/images/guidance-bg.svg';

const ENTER_KEY_CODE = 13;
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;

interface Props {
  assignment: DraftAssignment;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
export class AssignmentTitle extends Component<Props> {
  private descriptionField: HTMLTextAreaElement | null = null;
  private titleField: HTMLTextAreaElement | null = null;
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  private focusDescriptionField = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const startQuote = '«»';
    if (e.keyCode === ENTER_KEY_CODE) {
      this.descriptionField!.selectionStart = this.descriptionField!.selectionEnd = this.descriptionField!.value.length;
      this.descriptionField!.focus();
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

  public setAssignmentTitle = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
    if (value === '' || lettersNoEn(value)) {
      this.props.assignment.setTitle(value);
    }
  }

  public setAssignmentDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
    if (value === '' || lettersNoEn(value)) {
      this.props.assignment.setDescription(value);
    }
  }

  public setHighlightedItem = () => {
    this.props.newAssignmentStore!.setHighlightingItem(CreationElements.Title);
  }

  public componentDidMount() {
    this.titleRef.current!.focus();
    this.titleRef.current!.selectionStart = this.titleRef.current!.selectionEnd - this.titleRef.current!.value!.length;
    // this.titleField!.setSelectionRange(this.props.assignment.title.length, this.props.assignment.title.length);
  }

  public openModalTGAssig = (nroLevel: string) => {
    this.props.newAssignmentStore!.openTeacherGuidanceAssig(nroLevel);
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
            inputRef={this.titleRef}
            maxLength={MAX_TITLE_LENGTH}
            aria-labelledby="titleInputTextArea"
          />
          <label id="DescriptionInputTextArea" className="hidden">{intl.get('new assignment.title.description_placeholder')}</label>
          <TextAreaAutosize
            className={`newAssignmentDescriptionInput fw300 ${lightItem}`}
            placeholder={intl.get('new assignment.title.description_placeholder')}
            value={assignment.description}
            onChange={this.setAssignmentDescription}
            onKeyUp={this.focusTextField}
            inputRef={this.descriptionRef}
            maxLength={MAX_DESCRIPTION_LENGTH_500}
            aria-labelledby="DescriptionInputTextArea"
          />
          <div className="sectionGuidance">
            <CreateButton
              title={newAssignmentStore!.getTitleButtonGuidance}
              onClick={this.openModalTGAssig.bind(this, '0')}
            >
              <img src={teaGuiBGImg} alt={newAssignmentStore!.getTitleButtonGuidance} />
              {newAssignmentStore!.getTitleButtonGuidance}
            </CreateButton>
          </div>
        </div>
      </div>
    );
  }
}
