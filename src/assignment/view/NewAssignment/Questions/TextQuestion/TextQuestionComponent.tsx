import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { SortableElement, SortEnd, SortEvent } from 'react-sortable-hoc';
import TextAreaAutosize from 'react-textarea-autosize';

import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { MoreOptions } from '../../MoreOptions/MoreOptions';
import { CreationElements, NewAssignmentStore } from '../../NewAssignmentStore';
import { ContentBlockType } from '../../../../ContentBlock';
import { QuestionContentPanel } from '../QuestionContentPanel';
import { MappingContentBlocks } from '../MappingContentBlocks';
import { AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH } from 'utils/constants';

import textQuestionIcon from 'assets/images/new-text-question.svg';
import textQuestionIconPink from 'assets/images/new-text-question-pink.svg';

import '../Questions.scss';
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;
interface TextQuestionProps {
  question: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
class TextQuestionContent extends Component<TextQuestionProps> {
  public static contextType = AttachmentContentTypeContext;
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  public addNewContentBlock = (type: ContentBlockType): void => {
    const { question, newAssignmentStore } = this.props;

    question.addContentBlock(type, question);
    const filteredBlocks = question.content.filter(block => block.type === type);
    newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    newAssignmentStore!.setCurrentContentBlock(question.orderPosition, filteredBlocks[filteredBlocks.length - 1].order);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  public handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { question } = this.props;
    e.preventDefault();
    const value = this.useValuedQuotes(e.currentTarget.value);
    if (lettersNoEn(value)) {
      question.setTitle(value);
    }
  }

  public focusTextField  = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const startQuote = '«»';
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

  public onSortEnd = (data: SortEnd, event: SortEvent) => {
    const { question } = this.props;

    question.reorderContentBlocks(
      data.oldIndex,
      data.newIndex
    );
  }

  public render() {
    const { question, newAssignmentStore } = this.props;
    const order = question.orderPosition + 1;
    const titleId = `id_question_${question.orderPosition}`;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Questions, question.orderPosition) ? 'lightItem' : '';
    const hasError = newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition;

    return (
      <div className={`NewTextQuestion flexBox dirColumn ${lightItem} ${hasError && 'hasError'}`}>
        <div className="questionTitle flexBox spaceBetween alignCenter">
          <div className="flexBox alignCenter">
            <img src={hasError ? textQuestionIconPink : textQuestionIcon} alt="Text question" className={'questionIcon'}/>
            <span className={`questionTitleText ${hasError && 'questionTitleText-hasError'}`}>{intl.get('new assignment.TEXT')}</span>
          </div>
        </div>
        <label id={titleId} className="hidden">{intl.get('new assignment.Enter a question')}</label>
        <TextAreaAutosize
          className={`newTextQuestionInput ${lightItem}`}
          placeholder={intl.get('new assignment.Enter a question')}
          value={question.title}
          onChange={this.handleChangeTitle}
          onKeyUp={this.focusTextField}
          inputRef={this.titleRef}
          maxLength={MAX_DESCRIPTION_LENGTH}
          aria-labelledby={titleId}
          autoFocus
        />
        <div className="absQuestionMoreOptions">
          <div className={`${hasError && 'questionTitleText-hasError'} flexBox`}>
            {intl.get('new assignment.Question')} {order}
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
      </div>
    );
  }
}

export const TextQuestionComponent = SortableElement(TextQuestionContent);
