import React, { Component, SyntheticEvent, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { SortableContainer, SortableElement, SortEnd } from 'react-sortable-hoc';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import {
  EditableImageChoiceQuestion, EditableImageChoiceQuestionOption,
} from 'assignment/assignmentDraft/AssignmentDraft';
import { CreationElements, NewAssignmentStore } from '../../NewAssignmentStore';
import { AttachmentContentType, AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { lettersNoEn } from 'utils/lettersNoEn';

import landscape from 'assets/images/landscape.svg';
import checkActiveIcon from 'assets/images/check-active.svg';
import checkInactiveIcon from 'assets/images/ckeck-inactive.svg';
import deleteIcon from 'assets/images/delete.svg';
import minus from 'assets/images/icon-minus.svg';
import plus from 'assets/images/icon-plus.svg';

import './ImageChoiceQuestion.scss';

type OptionDeleteHandler = (index: number) => void;

interface OptionComponentProps {
  option: EditableImageChoiceQuestionOption;
  indexAsProp: number;
  onDelete: OptionDeleteHandler;
  hasEnoughOptionsAndRightOptions: boolean;
  newAssignmentStore?: NewAssignmentStore;
  orderQuestion: number;
  optionLengthBoolean: boolean;
}

@inject('newAssignmentStore')
@observer
class OptionComponent extends Component<OptionComponentProps> {
  public static contextType = AttachmentContentTypeContext;
  private refbutton = createRef<HTMLButtonElement>();

  private onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      this.props.option.setTitle(e.target.value);
    }
  }

  private toggleIsRight = () => {
    const { option } = this.props;

    option.setIsRight(!option.isRight);
  }

  private onDelete = () => {
    const { indexAsProp, onDelete } = this.props;

    onDelete(indexAsProp);
  }

  private handleImage = () => {
    const { option, newAssignmentStore, orderQuestion } = this.props;
    if (option.image) {
      option.removeImage();
    } else {
      // newAssignmentStore!.setCurrentContentBlock(option.question.orderPosition, -1);
      this.context.changeContentType(AttachmentContentType.image);
      newAssignmentStore!.setHighlightingItem(CreationElements.Questions, orderQuestion);
    }
  }

  private setCurrentOption = (e: SyntheticEvent) => {
    const { newAssignmentStore, indexAsProp } = this.props;
    e.stopPropagation();
    newAssignmentStore!.setCurrentOption(indexAsProp);
  }

  private renderMiniImage = () => {
    const { option } = this.props;
    if (option.image && option.image.path) {
      return option.image.path;
    }
    return landscape;
  }
  public async componentDidMount() {
    const { optionLengthBoolean } = this.props;
    if (optionLengthBoolean && this.refbutton.current) {
      this.refbutton.current!.focus();
    }
  }

  public closeImageChoice = () => {
    const { newAssignmentStore, orderQuestion } = this.props;

    this.context.changeContentType(AttachmentContentType.text);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, orderQuestion);
    newAssignmentStore!.setCurrentPreviewQuestion(orderQuestion);
  }

  public renderImageHandler = () => {
    const { option } = this.props;
    if (option.image) {
      return minus;
    }
    return plus;
  }

  public render() {
    const { option, hasEnoughOptionsAndRightOptions, newAssignmentStore } = this.props;

    const placeholder = intl.get('new assignment.Image caption');
    const hasErrorOption = (!option.isValid || !hasEnoughOptionsAndRightOptions) && newAssignmentStore!.showValidationErrors;

    const className = classnames('imageOption', {
      hasErrorOption,
      isRight: option.isRight,
    });

    return (
      <div className={className} onClick={this.setCurrentOption}>
        <img src={this.renderMiniImage()} alt="landscape" className={'miniImage'}/>
        <button onClick={this.handleImage} title="add-remove" ref={this.refbutton} >
          <img src={this.renderImageHandler()} alt="add-remove" title="add-remove" className={'handleImage'}/>
        </button>
        <input
          className="inputImageOption fw500"
          value={option.title}
          onChange={this.onTitleChange}
          style={option.isRight ? { color: '#0A7B24' } : undefined}
          placeholder={placeholder}
          onClick={this.closeImageChoice}
          aria-required="true"
          aria-invalid="false"
        />

        <div className="statusBox" onClick={this.closeImageChoice}>
          <button className="status" onClick={this.toggleIsRight} title="Status">
            <img
              src={option.isRight ? checkActiveIcon : checkInactiveIcon}
              alt="Status"
              title="Status"
              className="checkStatus"
            />
          </button>
          <button onClick={this.onDelete} title="Delete">
            <img src={deleteIcon} alt="Delete" title="Delete" style={{ width: 18 }}/>
          </button>
        </div>
      </div>
    );
  }
}

const SortableOptionComponent = SortableElement(OptionComponent);

interface OptionsListComponentProps {
  options: Array<EditableImageChoiceQuestionOption>;
  hasEnoughOptionsAndRightOptions: boolean;
  optionLengthBoolean: boolean;
  onDeleteOption: OptionDeleteHandler;
  orderQuestion: number;
  setCurrentQuestion(): void;
}

@observer
class ImageOptionsListComponent extends Component<OptionsListComponentProps> {
  private renderOption = (option: EditableImageChoiceQuestionOption, index: number) => {
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
        orderQuestion={this.props.orderQuestion}
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

export const OptionsListHolder = SortableContainer(ImageOptionsListComponent);

interface OptionsListProps {
  question: EditableImageChoiceQuestion;
  setCurrentQuestion(): void;
}

@observer
export class ImageOptionsList extends Component<OptionsListProps> {
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
        optionLengthBoolean={false}
        helperClass="z10"
        distance={distance}
        onSortEnd={this.onSortEnd}
        setCurrentQuestion={this.props.setCurrentQuestion}
        orderQuestion={question.orderPosition}
      />
    );
  }
}
