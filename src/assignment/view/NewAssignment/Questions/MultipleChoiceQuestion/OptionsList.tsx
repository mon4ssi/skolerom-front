import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { SortableContainer, SortableElement, SortEnd } from 'react-sortable-hoc';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { EditableMultipleChoiceQuestion, EditableMultipleChoiceQuestionOption } from 'assignment/assignmentDraft/AssignmentDraft';

import { NewAssignmentStore } from '../../NewAssignmentStore';

import checkActiveIcon from 'assets/images/check-active.svg';
import checkInactiveIcon from 'assets/images/ckeck-inactive.svg';
import deleteIcon from 'assets/images/delete.svg';

import './OptionsList.scss';

type OptionDeleteHandler = (index: number) => void;

interface OptionComponentProps {
  option: EditableMultipleChoiceQuestionOption;
  indexAsProp: number;
  onDelete: OptionDeleteHandler;
  hasEnoughOptionsAndRightOptions: boolean;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
class OptionComponent extends Component<OptionComponentProps> {
  private onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.option.setTitle(e.target.value);
  }

  private toggleIsRight = () => {
    const { option } = this.props;
    option.setIsRight(!option.isRight);
  }

  private onDelete = () => {
    const { indexAsProp, onDelete } = this.props;

    onDelete(indexAsProp);
  }

  public render() {
    const { option, hasEnoughOptionsAndRightOptions, newAssignmentStore } = this.props;
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
          style={option.isRight ? { color: '#0A7B24' } : undefined}
          placeholder={placeholder}
          aria-required="true"
          aria-invalid="false"
        />

        <div className="statusBox">
          <button onClick={this.toggleIsRight} className="status">
            <img
              src={option.isRight ? checkActiveIcon : checkInactiveIcon}
              alt="Status"
              className="checkStatus"
            />
          </button>
          <button onClick={this.onDelete}>
            <img src={deleteIcon} className={'delete'} alt="Delete" style={{ width: 18 }} />
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
  onDeleteOption: OptionDeleteHandler;
  setCurrentQuestion(): void;
}

@observer
class OptionsListComponent extends Component<OptionsListComponentProps> {
  private renderOption = (option: EditableMultipleChoiceQuestionOption, index: number) => {
    const key = `option-${index}`;

    return (
      <SortableOptionComponent
        key={key}
        option={option}
        indexAsProp={index}
        index={index}
        onDelete={this.props.onDeleteOption}
        hasEnoughOptionsAndRightOptions={this.props.hasEnoughOptionsAndRightOptions}
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
        onDeleteOption={this.onDeleteOption}
        helperClass="z10"
        distance={distance}
        onSortEnd={this.onSortEnd}
        setCurrentQuestion={this.props.setCurrentQuestion}
      />
    );
  }
}
