import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { SortableContainer, SortableElement, SortEnd } from 'react-sortable-hoc';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { EditableMultipleChoiceQuestion, EditableMultipleChoiceQuestionOption } from 'assignment/assignmentDraft/AssignmentDraft';

import { NewAssignmentStore } from '../../NewAssignmentStore';

import checkActiveIcon from 'assets/images/check-active.svg';
import checkInactiveIcon from 'assets/images/ckeck-inactive.svg';
import deleteIcon from 'assets/images/delete.svg';
import { lettersNoEn } from 'utils/lettersNoEn';

import './OptionsList.scss';
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;
type OptionDeleteHandler = (index: number) => void;

interface OptionComponentProps {
  option: EditableMultipleChoiceQuestionOption;
  indexAsProp: number;
  onDelete: OptionDeleteHandler;
  hasEnoughOptionsAndRightOptions: boolean;
  newAssignmentStore?: NewAssignmentStore;
  optionLengthBoolean: boolean;
}

@inject('newAssignmentStore')
@observer
class OptionComponent extends Component<OptionComponentProps> {
  private titleRef = createRef<HTMLInputElement>();
  private onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
    if (lettersNoEn(value)) {
      this.props.option.setTitle(value);
    }
  }

  private toggleIsRight = () => {
    const { option } = this.props;
    option.setIsRight(!option.isRight);
  }

  private onDelete = () => {
    const { indexAsProp, onDelete } = this.props;
    this.props.newAssignmentStore!.showDeleteButton = true;
    onDelete(indexAsProp);
  }

  private focusTextField  = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.keyCode === ENTER_SINGLE_QUOTE_CODE || e.keyCode === ENTER_DOUBLE_QUOTE_CODE) {
      setTimeout(
        () => {
          this.titleRef.current!.selectionEnd = Number(this.titleRef.current!.value!.length) - 1;
          this.titleRef.current!.focus();
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

  public render() {
    const { optionLengthBoolean, option, hasEnoughOptionsAndRightOptions, newAssignmentStore } = this.props;
    const placeholder = intl.get('new assignment.write_your_answer_here');
    const hasErrorOption = (!option.isValid || !hasEnoughOptionsAndRightOptions) && newAssignmentStore!.showValidationErrors;
    const className = classnames('option', {
      hasErrorOption,
      isRight: option.isRight,
    });
    return (
      <div className={className}>
        <input
          value={option.title}
          onChange={this.onTitleChange}
          onKeyUp={this.focusTextField}
          style={option.isRight ? { color: '#0A7B24' } : undefined}
          placeholder={placeholder}
          aria-required="true"
          aria-invalid="false"
          ref={this.titleRef}
          autoFocus={optionLengthBoolean && true}
        />

        <div className="statusBox">
          <button onClick={this.toggleIsRight} className="status" title="Status">
            <img
              src={option.isRight ? checkActiveIcon : checkInactiveIcon}
              alt="Status"
              title="Status"
              className="checkStatus"
            />
          </button>
          <button onClick={this.onDelete} title="Delete">
            <img src={deleteIcon} className={'delete'} alt="Delete" title="Delete" style={{ width: 18 }} />
          </button>
        </div>
      </div>
    );
  }
}

const SortableOptionComponent = SortableElement(OptionComponent);

interface OptionsListComponentProps {
  options: Array<EditableMultipleChoiceQuestionOption>;
  hasEnoughOptionsAndRightOptions: boolean;
  optionLengthBoolean: boolean;
  onDeleteOption: OptionDeleteHandler;
  setCurrentQuestion(): void;
}

@observer
class OptionsListComponent extends Component<OptionsListComponentProps> {
  private renderOption = (option: EditableMultipleChoiceQuestionOption, index: number) => {
    const key = `option-${index}`;
    let constantTrue = false;
    if (index > 0) {
      constantTrue = true;
    }

    return (
      <SortableOptionComponent
        key={key}
        option={option}
        indexAsProp={index}
        index={index}
        onDelete={this.props.onDeleteOption}
        hasEnoughOptionsAndRightOptions={this.props.hasEnoughOptionsAndRightOptions}
        optionLengthBoolean={constantTrue}
      />
    );
  }

  public render() {
    return (
      <div className="options" onClick={this.props.setCurrentQuestion}>
        {this.props.options.map(this.renderOption)}
      </div>
    );
  }
}

export const OptionsListHolder = SortableContainer(OptionsListComponent);

interface OptionsListProps {
  question: EditableMultipleChoiceQuestion;
  setCurrentQuestion(): void;
}

@observer
export class OptionsList extends Component<OptionsListProps> {
  private onSortEnd = (data: SortEnd) => {
    const { question } = this.props;

    question.reorderOptions(
      data.oldIndex,
      data.newIndex
    );
  }

  private onDeleteOption = (index: number) => {
    this.props.question.deleteOption(index);
  }

  public render() {
    const { question } = this.props;
    const distance = 1;

    return (
      <OptionsListHolder
        options={question.options}
        hasEnoughOptionsAndRightOptions={question.hasEnoughOptionsAndRightOptions}
        optionLengthBoolean={false}
        onDeleteOption={this.onDeleteOption}
        helperClass="z10"
        distance={distance}
        onSortEnd={this.onSortEnd}
        setCurrentQuestion={this.props.setCurrentQuestion}
      />
    );
  }
}
