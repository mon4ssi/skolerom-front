import React, { Component, createRef } from 'react';
import { SortableElement, SortEnd, SortEvent } from 'react-sortable-hoc';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import TextAreaAutosize from 'react-textarea-autosize';

import { CreationElements, NewAssignmentStore } from '../../NewAssignmentStore';
import { MappingContentBlocks } from '../../Questions/MappingContentBlocks';
import { QuestionContentPanel } from '../../Questions/QuestionContentPanel';
import { MoreOptions } from '../../MoreOptions/MoreOptions';
import { EditableImageChoiceQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { ImageOptionsList } from './ImageOptionsList';
import { ContentBlockType } from '../../../../ContentBlock';
import { AttachmentContentType, AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH } from 'utils/constants';

import imageChoiceLight from 'assets/images/image-choice-light.svg';
import imageChoiceLightPink from 'assets/images/image-choice-light-pink.svg';

import './ImageChoiceQuestion.scss';
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;
interface Props {
  question: EditableImageChoiceQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
class ImageChoiceQuestion extends Component<Props> {
  public static contextType = AttachmentContentTypeContext;
  private refbutton = createRef<HTMLButtonElement>();
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  private addNewOption = () => {
    const { question } = this.props;

    question.addNewOption();
  }

  private setCurrentQuestion = () => {
    const { question, newAssignmentStore } = this.props;
    newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  private handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { question } = this.props;
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
    if (lettersNoEn(value)) {
      question.setTitle(value);
    }
  }

  private focusTextField  = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
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

  public async componentDidUpdate() {
    if (this.refbutton.current && this.props.newAssignmentStore!.showDeleteButton) {
      this.refbutton.current!.focus();
      this.props.newAssignmentStore!.showDeleteButton = false;
    }
  }

  public addNewContentBlock = (type: ContentBlockType) => {
    const { question, newAssignmentStore } = this.props;
    question.addContentBlock(type, question);
    const filteredBlocks = question.content.filter(block => block.type === type);
    newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    newAssignmentStore!.setCurrentContentBlock(question.orderPosition, filteredBlocks[filteredBlocks.length - 1].order);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  public isDisabledButton = () => {
    const { newAssignmentStore } = this.props;
    return this.context.contentType === AttachmentContentType.image && newAssignmentStore!.currentOrderOption >= 0;
  }

  public onSortEnd = (data: SortEnd, event: SortEvent) => {
    event.preventDefault();
    const { question } = this.props;

    question.reorderContentBlocks(
      data.oldIndex,
      data.newIndex
    );
  }

  public render() {
    const { question, newAssignmentStore } = this.props;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Questions, question.orderPosition) ? 'lightItem' : '';
    const hasError = newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition;

    return (
      <div className={`NewMultipleChoiceQuestion flexBox dirColumn ${lightItem} ${hasError && 'hasError'}`} onClick={this.setCurrentQuestion}>
        <div className="questionTitle flexBox spaceBetween alignCenter">
          <div className="flexBox alignCenter">
            <img src={hasError ? imageChoiceLightPink : imageChoiceLight} alt="New multiple choice question" className={'questionIcon'}/>
            <span className={`questionTitleText ${hasError && 'questionTitleText-hasError'}`}>{intl.get('new assignment.IMAGE_CHOICE')}</span>
          </div>

        </div>

        <TextAreaAutosize
          className={`newTextQuestionInput ${lightItem}`}
          placeholder={intl.get('new assignment.Enter a question')}
          value={question.title}
          onChange={this.handleChangeTitle}
          onKeyUp={this.focusTextField}
          inputRef={this.titleRef}
          maxLength={MAX_DESCRIPTION_LENGTH}
          autoFocus
        />
        <div className="absQuestionMoreOptions">
          <div className={`${hasError && 'questionTitleText-hasError'} flexBox`}>
            {intl.get('new assignment.Question')} {question.orderPosition + 1}
            <MoreOptions
              question={question}
              newAssignmentStore={newAssignmentStore}
            />
          </div>
        </div>

        <MappingContentBlocks question={question} helperClass="content-block-dragged" onSortEnd={this.onSortEnd} useDragHandle />

        <div className="flexBox spaceBetween alignCenter questionControlPanel">
          <QuestionContentPanel
            question={question}
            addNewContentBlock={this.addNewContentBlock}
          />
        </div>

        <ImageOptionsList question={question} setCurrentQuestion={this.setCurrentQuestion}/>

        <div className={'functionalButtons'}>
          <button
            disabled={this.isDisabledButton()}
            className="newAnswerButton CreateButton"
            onClick={this.addNewOption}
            title={intl.get('new assignment.Add image')}
            ref={this.refbutton}
          >
            {intl.get('new assignment.Add image')}
          </button>
        </div>
      </div>
    );
  }
}

export const ImageChoiceQuestionComponent = SortableElement(ImageChoiceQuestion);
